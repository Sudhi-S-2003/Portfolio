import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { Section } from '../../components/layout/Section';
import { TagList } from '../../components/ui/TagList';
import { Diagram } from './Diagram';
import { PROJECTS, type Project } from './projects';

type Decision = { title: string; body: string };

function MetaRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1 lg:grid-cols-[11rem_minmax(0,1fr)] lg:gap-x-12">
      <dt className="meta pt-0.5">{label}</dt>
      <dd className="text-ink">{children}</dd>
    </div>
  );
}

function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  const { t } = useTranslation('common');
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
      <span className="sr-only"> ({t('actions.opensInNewTab')})</span>
    </a>
  );
}

export function CaseStudy({ project }: { project: Project }) {
  const { t, i18n } = useTranslation(['projects', 'work', 'common']);
  const key = (name: string) => `projects:${project.slug}.${name}`;
  const has = (name: string) => i18n.exists(key(name));
  const built = t(key('built'), { returnObjects: true }) as string[];
  const decisions = t(key('decisions'), { returnObjects: true }) as Decision[];
  const showDiagram = Boolean(project.diagram) && has('diagramCaption');
  const showHard = has('hard');
  const showNext = has('next');
  const index = PROJECTS.findIndex((item) => item.slug === project.slug);
  const nextProject = PROJECTS[(index + 1) % PROJECTS.length];

  return (
    <article>
      <Link to="/work" className="meta inline-flex min-h-11 items-center no-underline hover:underline">
        {t('common:actions.backToWork')}
      </Link>

      <header className="max-w-measure pt-4 pb-10 sm:pb-14">
        <h1 className="text-4xl sm:text-5xl">{t(key('title'))}</h1>
        <p className="mt-5 text-xl text-ink-muted">{t(key('summary'))}</p>
      </header>

      <dl className="grid gap-4 border-t border-line py-8">
        <MetaRow label={t('work:caseStudy.role')}>{t(key('role'))}</MetaRow>
        <MetaRow label={t('work:caseStudy.period')}>{t(key('period'))}</MetaRow>
        <MetaRow label={t('work:caseStudy.status')}>{t(key('status'))}</MetaRow>
        <MetaRow label={t('work:caseStudy.stack')}>
          <TagList items={project.stack} label={t('work:caseStudy.stack')} />
        </MetaRow>
        <MetaRow label={t('work:caseStudy.links')}>
          {project.private ? (
            <span className="text-ink-muted">{t('work:caseStudy.private')}</span>
          ) : (
            <span className="flex flex-wrap gap-x-6 gap-y-1">
              {project.repo ? <ExternalLink href={project.repo}>{t('work:caseStudy.source')}</ExternalLink> : null}
              {project.live ? <ExternalLink href={project.live}>{t('work:caseStudy.live')}</ExternalLink> : null}
            </span>
          )}
        </MetaRow>
      </dl>

      <Section label={t('work:caseStudy.problem')}>
        <p className="max-w-measure">{t(key('problem'))}</p>
      </Section>

      <Section label={t('work:caseStudy.built')}>
        <ul className="prose">
          {built.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </Section>

      <Section label={t('work:caseStudy.how')}>
        <p className="max-w-measure">{t(key('how'))}</p>
        {showDiagram && project.diagram ? (
          <Diagram diagram={project.diagram} caption={t(key('diagramCaption'))} />
        ) : null}
      </Section>

      <Section label={t('work:caseStudy.decisions')}>
        <div className="max-w-measure space-y-7">
          {decisions.map((decision) => (
            <div key={decision.title}>
              <h3 className="text-xl">{decision.title}</h3>
              <p className="mt-1.5">{decision.body}</p>
            </div>
          ))}
        </div>
      </Section>

      {showHard ? (
        <Section label={t('work:caseStudy.hard')}>
          <p className="max-w-measure">{t(key('hard'))}</p>
        </Section>
      ) : null}

      {showNext ? (
        <Section label={t('work:caseStudy.next')}>
          <p className="max-w-measure">{t(key('next'))}</p>
        </Section>
      ) : null}

      {nextProject && nextProject.slug !== project.slug ? (
        <div className="grid gap-1 border-t border-line pt-8 lg:grid-cols-[11rem_minmax(0,1fr)] lg:gap-x-12">
          <p className="meta pt-1.5">{t('work:caseStudy.nextProject')}</p>
          <Link to={`/work/${nextProject.slug}`} className="font-serif text-2xl">
            {t(`projects:${nextProject.slug}.title`)}
          </Link>
        </div>
      ) : null}
    </article>
  );
}
