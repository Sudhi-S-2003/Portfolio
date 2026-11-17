/** Facts that are the same in every language. Words live in public/locales. */
export const SITE = {
  name: 'Sudhi S',
  url: 'https://sudhis.netlify.app',
  email: 'sudhiselampa19@gmail.com',
  linkedin: 'https://www.linkedin.com/in/sudhi-s-a2a4ab30b',
  linkedinLabel: 'linkedin.com/in/sudhi-s-a2a4ab30b',
  github: 'https://github.com/Sudhi-S-2003',
  githubLabel: 'github.com/Sudhi-S-2003',
  resumeUrl: '/files/Sudhi-S-Resume.pdf',
  timeZone: 'Asia/Kolkata',
  /** When the "Now" section was last true. Year and month (1-12). */
  nowUpdated: { year: 2026, month: 11 },
} as const;

/** Career entries, newest first. Text is under home.experience.<id> in each language. */
export const EXPERIENCE = [
  { id: 'oxium', start: { year: 2025, month: 6 }, end: null },
  { id: 'avodha', start: { year: 2024, month: 8 }, end: { year: 2025, month: 5 } },
  { id: 'education', start: null, end: null },
] as const;

/** Product names: the same in every language. Area names are translated (about.tools.<area>). */
export const TOOLS = {
  backend: ['Node.js', 'TypeScript', 'NestJS', 'Express', 'Fastify', 'Prisma'],
  data: ['PostgreSQL', 'MongoDB', 'Redis', 'Kafka', 'BullMQ'],
  frontend: ['React', 'Next.js', 'TanStack Query', 'Zustand', 'Tailwind CSS'],
  infra: ['Docker', 'Kubernetes (k3s)', 'Argo CD', 'Traefik', 'Caddy'],
} as const;
