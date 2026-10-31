import { DEFAULT_MESSAGES } from '../i18n/resolveMessages';
import { formatDateToISO } from '../util/DateUtil';

/** Characters not accepted in file names by some operating system, plus the spaces. */
const INVALID_FILE_NAME_CHARS = /[\s/\\:*?"<>|]+/g;

/** Accent marks, separated from the letters by the NFD normalization. */
const DIACRITICS = /\p{Diacritic}/gu;

/**
 * Builds the name of the exported file: the base name without accents or invalid characters, the generation date and
 * the extension (e.g. "sales-north-2026-10-20.xlsx"). Without accents, the name works in any system and e-mail
 * attachment.
 * @param baseName desired name, without date or extension
 * @param generatedAt date the data was generated
 * @param extension extension of the format, without the dot
 * @param defaultName name used when the base name has no valid character; defaults to the one of the default locale
 * @return the name of the file
 */
export function exportFileName(
    baseName: string,
    generatedAt: Date,
    extension: string,
    defaultName: string = DEFAULT_MESSAGES.export.defaultFileName
): string {
    const name = baseName
        .normalize('NFD')
        .replace(DIACRITICS, '')
        .replace(INVALID_FILE_NAME_CHARS, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .toLowerCase();

    return `${name || defaultName}-${formatDateToISO(generatedAt)}.${extension}`;
}
