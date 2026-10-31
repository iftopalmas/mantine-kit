/**
 * Record that may have an id, the minimum requirement of the components that show or edit records (tables, tabs and
 * forms). A record without an id was not saved yet.
 */
export interface Identifiable {
    id?: number | string | null;
}
