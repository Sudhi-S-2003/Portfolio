import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { TagList } from '../../components/ui/TagList';
import type { Project } from './projects';

/** Projects as a dated list: year in the margin, title, one line, stack. */
export function WorkList({ projects, headingLevel = 3 }: { projects: Project[]; headingLevel?: 2 | 3 }) {
  const { t } = useTranslation(['projects', 'work']);
  // Level 3 under a section heading (home page), level 2 straight under the page title (work page).
  const Heading = headingLevel === 2 ? 'h2' : 'h3';
  return (
    <ul className="divide-y divide-line">
      {projects.map((project) => (
        <li key={project.slug}>
          <article className="grid gap-1 py-5 first:pt-0 sm:grid-cols-[5.5rem_minmax(0,1fr)] sm:gap-x-6">
            <p className="meta pt-1.5">{project.year}</p>
            <div>
              <Heading className="text-xl sm:text-2xl">
                <Link
                  to={`/work/${project.slug}`}
                  className="text-ink no-underline hover:text-accent hover:underline"
                >
                  {t(`projects:${project.slug}.title`)}
                </Link>
              </Heading>
              <p className="mt-1.5 max-w-measure text-ink-muted">{t(`projects:${project.slug}.summary`)}</p>
              <div className="mt-2.5">
                <TagList items={project.stack.slice(0, 5)} label={t('work:stackLabel')} />
              </div>
            </div>
          </article>
        </li>
      ))}
    </ul>
  );
}
