import { describe, expect, test } from '@jest/globals';
import { parseActionsPageParams } from '@/src/util/parseActionsPageParams';
import { FormType } from '@/src/component/template/FormPage/FormType';
import { PORTUGUESE_FORM_ROUTE_SEGMENTS } from '@/src/router/FormRouteSegments';

describe('parseActionsPageParams', () => {
    test('throws when there are no params', () => {
        expect(() => parseActionsPageParams(null)).toThrow('Missing params');
    });

    test('throws for an unknown action', () => {
        const params = ['invalid-action'];
        expect(() => parseActionsPageParams(params)).toThrow('Invalid params');
    });

    test('reads the valid actions with the default segments', () => {
        type TestDataRecord = Record<FormType, { params: string[]; result: { action: FormType; id?: string } }>;

        const dataRecord: TestDataRecord = {
            [FormType.Edit]: { params: ['edit', '1'], result: { action: FormType.Edit, id: '1' } },
            [FormType.View]: { params: ['view', '2'], result: { action: FormType.View, id: '2' } },
            [FormType.Create]: { params: ['create'], result: { action: FormType.Create } }
        };

        // Precondition: the key of the record must be equal to the value of result.action for the test to work
        Object.entries(dataRecord).forEach(([key, value]) => {
            expect(key).toEqual(value.result.action.toString());
            expect(parseActionsPageParams(value.params)).toStrictEqual(value.result);
        });
    });

    test('reads the actions with the segments chosen by the app', () => {
        const segments = PORTUGUESE_FORM_ROUTE_SEGMENTS;

        expect(parseActionsPageParams(['criar'], segments)).toStrictEqual({ action: FormType.Create });
        expect(parseActionsPageParams(['editar', '3'], segments)).toStrictEqual({ action: FormType.Edit, id: '3' });
        expect(parseActionsPageParams(['visualizar', '4'], segments)).toStrictEqual({ action: FormType.View, id: '4' });
        expect(() => parseActionsPageParams(['create'], segments)).toThrow('Invalid params');
        expect(parseActionsPageParams(['new'], { create: 'new', edit: 'change', view: 'show' })).toStrictEqual({
            action: FormType.Create
        });
    });
});
