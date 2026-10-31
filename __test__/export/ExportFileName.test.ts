import { describe, expect, test } from '@jest/globals';

import { exportFileName } from '@/src/export/ExportFileName';
import { GENERATED_AT } from '@/__test__/export/ExportFixture';

describe('exportFileName', () => {
    test('removes accents, spaces and invalid characters and adds the date and the extension', () => {
        expect(exportFileName('Planilha São Félix: 2026/2030', GENERATED_AT, 'xlsx')).toBe(
            'planilha-sao-felix-2026-2030-2026-10-20.xlsx'
        );
    });

    test('uses a default name when the base name ends up empty', () => {
        expect(exportFileName(' / ', GENERATED_AT, 'csv')).toBe('data-2026-10-20.csv');
        expect(exportFileName(' / ', GENERATED_AT, 'csv', 'dados')).toBe('dados-2026-10-20.csv');
    });
});
