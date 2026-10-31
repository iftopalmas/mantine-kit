import { DEFAULT_MESSAGES } from '../../i18n/resolveMessages';

/** Maximum length of a sheet name in Excel. */
export const MAX_SHEET_NAME_LENGTH = 31;

/** Characters Excel does not accept in a sheet name. */
const INVALID_CHARS = /[[\]:*?/\\]/g;

/** Spaces and apostrophes at the ends of the name: Excel accepts no apostrophe at the beginning or at the end. */
const EDGES = /^[\s']+|[\s']+$/g;

/** Name reserved by Excel, which cannot be used by a sheet (case insensitive). */
const RESERVED_NAME = 'history';

/**
 * Adapts the sheet names to the Excel rules: at most {@link MAX_SHEET_NAME_LENGTH} characters, without `[ ] : * ? /
 * \`, without an apostrophe at the beginning or at the end, without the reserved name "History" and without repeating
 * a name (Excel is case insensitive). A repeated or reserved name gets a number at the end (e.g. "Sales (2)").
 * @param names desired names, in the order of the sheets
 * @param defaultName builds the name of a sheet without any valid character, from its position (starting at 1);
 *        defaults to the one of the default locale
 * @return the names accepted by Excel, in the same order
 */
export function xlsxSheetNames(
    names: string[],
    defaultName: (position: number) => string = DEFAULT_MESSAGES.export.defaultSheetName
): string[] {
    const usedNames = new Set<string>([RESERVED_NAME]);

    return names.map((name, i) => {
        const sheetName = uniqueName(sanitize(name) || defaultName(i + 1), usedNames);
        usedNames.add(sheetName.toLowerCase());
        return sheetName;
    });
}

/**
 * Removes from the name the characters Excel does not accept.
 * @param name desired name of the sheet
 * @return the name without the invalid characters and without spaces or apostrophes at the ends
 */
function sanitize(name: string): string {
    return name.replace(INVALID_CHARS, '-').replace(EDGES, '');
}

/**
 * Cuts the name to the maximum length and adds a number if it is already used.
 * @param name name of the sheet, already without invalid characters
 * @param usedNames names already used, in lower case
 * @return a name not used yet
 */
function uniqueName(name: string, usedNames: Set<string>): string {
    let candidate = cut(name, MAX_SHEET_NAME_LENGTH);
    for (let number = 2; usedNames.has(candidate.toLowerCase()); number++) {
        const suffix = ` (${number})`;
        candidate = cut(name, MAX_SHEET_NAME_LENGTH - suffix.length) + suffix;
    }

    return candidate;
}

/**
 * Cuts the name to a length and removes again the spaces and apostrophes at the ends, which the cut may have left.
 * @param name name of the sheet
 * @param maxLength maximum length
 * @return the cut name
 */
function cut(name: string, maxLength: number): string {
    return name.slice(0, maxLength).replace(EDGES, '');
}
