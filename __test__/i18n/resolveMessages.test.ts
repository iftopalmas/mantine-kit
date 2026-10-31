import { describe, expect, test } from '@jest/globals';

import { KIT_MESSAGES, resolveMessages } from '@/src/i18n/resolveMessages';

/**
 * Returns the paths of all texts of a catalog (e.g. `common.back`, `chart.types.bar`).
 * @param value catalog or part of it
 * @param prefix path of the value
 */
function keyPaths(value: object, prefix: string = ''): string[] {
    return Object.entries(value).flatMap(([key, child]) =>
        typeof child === 'object' && child !== null ? keyPaths(child, `${prefix}${key}.`) : [`${prefix}${key}`]
    );
}

describe('message catalogs', () => {
    // The type already requires every key; this also catches an empty text left behind in a translation.
    test('every locale has the same texts, none of them empty', () => {
        const [first, ...others] = Object.values(KIT_MESSAGES);
        others.forEach(catalog => expect(keyPaths(catalog).sort()).toEqual(keyPaths(first).sort()));
        Object.values(KIT_MESSAGES).forEach(catalog =>
            Object.values(catalog).forEach(section => Object.values(section).forEach(text => expect(text).toBeTruthy()))
        );
    });

    test('en-US is the default locale', () => {
        expect(resolveMessages().common.back).toBe('Back');
        expect(resolveMessages('pt-BR').common.back).toBe('Voltar');
    });

    test('the app overrides some texts of a section and keeps the others of the locale', () => {
        const messages = resolveMessages('en-US', { common: { back: 'Return' } });

        expect(messages.common.back).toBe('Return');
        expect(messages.common.save).toBe('Save');
        expect(messages.table).toEqual(KIT_MESSAGES['en-US'].table);
    });

    test('builds the texts with variables in each language', () => {
        const date = new Date(2026, 9, 20, 14, 30);

        expect(resolveMessages('pt-BR').export.generatedAt(date)).toBe('Gerado em 20/10/2026 às 14:30');
        expect(resolveMessages('en-US').export.generatedAt(date)).toBe('Generated on 10/20/2026 at 2:30 PM');
        expect(resolveMessages('en-US').form.saveSuccess('Create')).toBe('Record created successfully!');
        expect(resolveMessages('en-US').form.saveSuccess('Update')).toBe('Record updated successfully!');
        expect(resolveMessages('pt-BR').table.pagination({ from: 1, to: 10, totalRecords: 42 })).toBe(
            'Exibindo 1 a 10 de 42 registros'
        );
    });
});
