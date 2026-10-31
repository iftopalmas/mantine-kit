/**
 * URL segments of the CRUD form pages, after the base path of a feature (e.g. `/region/edit/5`). They are not
 * translated with the locale, since a URL should not change with the user's language: the app chooses them once, in
 * the `formRouteSegments` option of the `KitProvider`, from the presets below or with its own words.
 */
export type FormRouteSegments = {
    create: string;
    edit: string;
    view: string;
};

/** English segments: `create`, `edit/:id` and `view/:id`. */
export const ENGLISH_FORM_ROUTE_SEGMENTS: FormRouteSegments = { create: 'create', edit: 'edit', view: 'view' };

/** Portuguese segments: `criar`, `editar/:id` and `visualizar/:id`. */
export const PORTUGUESE_FORM_ROUTE_SEGMENTS: FormRouteSegments = {
    create: 'criar',
    edit: 'editar',
    view: 'visualizar'
};

/** Segments used when the app chooses none: {@link ENGLISH_FORM_ROUTE_SEGMENTS}. */
export const DEFAULT_FORM_ROUTE_SEGMENTS: FormRouteSegments = ENGLISH_FORM_ROUTE_SEGMENTS;
