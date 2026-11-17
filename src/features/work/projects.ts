/**
 * Language-neutral facts about each project. Every sentence about a project lives in
 * public/locales/<language>/projects.json under the project's slug.
 */
export const PROJECT_SLUGS = [
  'distribution-erp',
  'dispatchhub',
  'apiforge',
  'movie-booking-platform',
  'nutrify',
] as const;

export type ProjectSlug = (typeof PROJECT_SLUGS)[number];

export type Project = {
  slug: ProjectSlug;
  year: string;
  /** Product names; shown as-is in every language. */
  stack: string[];
  repo?: string;
  live?: string;
  /** Client or employer code that cannot be linked. */
  private?: boolean;
  featured: boolean;
  /** Monospace architecture sketch using only technical names, so it needs no translation. */
  diagram?: string;
};

export const PROJECTS: Project[] = [
  {
    slug: 'distribution-erp',
    year: '2026',
    stack: ['NestJS', 'Fastify', 'Prisma', 'PostgreSQL', 'Kafka', 'Redis', 'React', 'TanStack Query', 'k3s', 'Argo CD'],
    private: true,
    featured: true,
    diagram: String.raw`React client (7 desks)       Tally agent
        │ HTTPS                        │
        ▼                              ▼
Caddy ─▶ Traefik ─▶ 11 NestJS services ─▶ tally-sync ─▶ TallyPrime
                     │        │       │
            PostgreSQL ×11  Kafka   Redis
                     │
                   Postal

k3s · Argo CD · CloudNativePG · Strimzi`,
  },
  {
    slug: 'dispatchhub',
    year: '2026',
    stack: ['NestJS', 'Next.js', 'PostgreSQL', 'Redis', 'BullMQ', 'Prisma', 'Postal'],
    repo: 'https://github.com/Sudhi-S-2003/DispatchHub',
    featured: true,
    diagram: String.raw`Next.js UI ──▶ NestJS API  (JWT · X-API-Key)
                  │
                  ├──▶ PostgreSQL 16
                  └──▶ Redis 7
                         queue:priority
                         queue:shard:0..3
                              │
                       shard-dispatcher
                              │
                         Postal MTA ──▶ Gmail · Outlook`,
  },
  {
    slug: 'apiforge',
    year: '2026',
    stack: ['NestJS', 'Prisma', 'PostgreSQL', 'BullMQ', 'Next.js', 'Monaco', 'Ajv', 'Playwright'],
    repo: 'https://github.com/Sudhi-S-2003/ApiForge',
    featured: true,
    diagram: String.raw`apps/web  (Next.js · Monaco)
    │
apps/api  (NestJS)
    ├──▶ PostgreSQL · Prisma
    ├──▶ Redis · BullMQ ──▶ export-worker (Playwright PDF · ZIP)
    └──▶ runner-proxy (SSRF guard) ──▶ target API

packages/shared  (@apiforge/shared)`,
  },
  {
    slug: 'movie-booking-platform',
    year: '2025–26',
    stack: ['TypeScript', 'Express', 'MongoDB', 'Redis', 'BullMQ', 'Socket.io', 'WebAuthn', 'React', 'Zustand'],
    repo: 'https://github.com/Sudhi-S-2003/movie_booking',
    featured: true,
    diagram: String.raw`React client ◀── Socket.io ──▶ realtime
    │ REST
Express API (TypeScript)
    ├──▶ MongoDB
    ├──▶ Redis ──▶ BullMQ workers
    ├──▶ WebAuthn · TOTP
    └──▶ /api/public  (API keys · HMAC links)`,
  },
  {
    slug: 'nutrify',
    year: '2024–25',
    stack: ['React', 'Node.js', 'Express', 'MongoDB', 'Redis', 'TanStack Query'],
    live: 'https://nutrify-frontend.onrender.com/',
    featured: false,
  },
];

export function isProjectSlug(value: string | undefined): value is ProjectSlug {
  return value !== undefined && (PROJECT_SLUGS as readonly string[]).includes(value);
}

export function getProject(slug: string | undefined): Project | undefined {
  return PROJECTS.find((project) => project.slug === slug);
}
