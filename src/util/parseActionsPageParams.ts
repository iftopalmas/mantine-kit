import { FormType } from '../component/template/FormPage/FormType';
import { DEFAULT_FORM_ROUTE_SEGMENTS, FormRouteSegments } from '../router/FormRouteSegments';

/** Action of a form page, read from the URL: create, edit or view, with the record id in the last two. */
export type FormRoute = { action: FormType; id?: string };

/**
 * Converts the segments of the catch-all route of a feature (e.g. `create`, `edit/:id`, `view/:id`) to the
 * form action. Throws an error if the segments do not form one of these routes.
 * @param params URL segments after the route of the feature (e.g. `['edit', '5']`)
 * @param segments names of the create, edit and view segments; defaults to {@link DEFAULT_FORM_ROUTE_SEGMENTS}
 */
export function parseActionsPageParams(
    params: string[] | string | null | undefined,
    segments: FormRouteSegments = DEFAULT_FORM_ROUTE_SEGMENTS
): FormRoute {
    const slugItems = Array.isArray(params) ? params : [params ?? ''];
    const type = slugItems[0];
    const id = slugItems[1];

    if (id && type === segments.edit) {
        return { action: FormType.Edit, id };
    }
    if (id && type === segments.view) {
        return { action: FormType.View, id };
    }
    if (type === segments.create) {
        return { action: FormType.Create };
    }

    // An array with a single empty element means that no parameter was given.
    const msg = slugItems.length == 1 && slugItems[0] == '' ? 'Missing params' : 'Invalid params: ' + slugItems;
    throw new Error(msg);
}
