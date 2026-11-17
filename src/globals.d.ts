/**
 * The year the site was built, set by `define` in vite.config.ts. The client and the pre-rendered HTML come from
 * the same build, so they always agree (a visitor's clock rolling over to a new year can't break hydration).
 */
declare const __BUILD_YEAR__: number;
