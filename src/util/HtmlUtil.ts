/** Characters with a special meaning in HTML and the entities that represent them as text. */
const HTML_ENTITIES: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
};

/**
 * Escapes the HTML special characters of a text, so it is shown as text, and not interpreted as HTML, when inserted in
 * an HTML snippet built as a string (e.g. an ECharts tooltip). It prevents data typed by a user with a tag (e.g.
 * `<img onerror=...>`) from running JavaScript (XSS).
 * @param text text to escape
 * @return the text with `&`, `<`, `>`, `"` and `'` replaced by the corresponding HTML entities
 */
export function escapeHtml(text: string): string {
    return text.replace(/[&<>"']/g, char => HTML_ENTITIES[char]);
}
