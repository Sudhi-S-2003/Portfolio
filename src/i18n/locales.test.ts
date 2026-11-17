import { describe, expect, it } from 'vitest';
import { NAMESPACES, SUPPORTED_LANGUAGES } from './languages';

type Tree = { [key: string]: string | Tree | Tree[] | string[] };

const files = import.meta.glob<Tree>('/public/locales/*/*.json', { eager: true, import: 'default' });

function load(language: string, namespace: string): Tree | undefined {
  return files[`/public/locales/${language}/${namespace}.json`];
}

/** Flatten nested keys to "a.b.0.c" -> value. */
function flatten(tree: unknown, prefix = ''): Map<string, string> {
  const out = new Map<string, string>();
  if (typeof tree === 'string') {
    out.set(prefix, tree);
    return out;
  }
  if (tree && typeof tree === 'object') {
    for (const [key, value] of Object.entries(tree)) {
      for (const [k, v] of flatten(value, prefix ? `${prefix}.${key}` : key)) out.set(k, v);
    }
  }
  return out;
}

function variables(text: string): string[] {
  return [...text.matchAll(/\{\{\s*(\w+)[^}]*\}\}/g)].map((m) => m[1] ?? '').sort();
}

const translated = SUPPORTED_LANGUAGES.filter((language) => language !== 'en');

describe('translation files', () => {
  for (const namespace of NAMESPACES) {
    const english = flatten(load('en', namespace));

    it(`en/${namespace}.json exists and has no empty strings`, () => {
      expect(load('en', namespace), `missing en/${namespace}.json`).toBeDefined();
      for (const [key, value] of english) expect(value.trim(), `en/${namespace}: ${key}`).not.toBe('');
    });

    for (const language of translated) {
      it(`${language}/${namespace}.json has exactly the English keys, filled in, with the same variables`, () => {
        const file = load(language, namespace);
        expect(file, `missing ${language}/${namespace}.json`).toBeDefined();
        const other = flatten(file);
        expect([...other.keys()].sort()).toEqual([...english.keys()].sort());
        for (const [key, value] of other) {
          expect(value.trim(), `${language}/${namespace}: ${key} is empty`).not.toBe('');
          expect(variables(value), `${language}/${namespace}: ${key} variables`).toEqual(
            variables(english.get(key) ?? ''),
          );
        }
      });
    }
  }
});
