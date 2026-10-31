import { describe, expect, test } from '@jest/globals';

import { selectedId } from '@/src/util/ValidationUtil';

const MESSAGE = 'A region must be selected';
const schema = selectedId(MESSAGE);

describe('selectedId', () => {
    test('accepts the positive integer id of a chosen item', () => {
        expect(schema.safeParse(5).success).toBe(true);
    });

    // 0 is the initial value of the field and null is the value of a cleared select.
    test.each([0, -1, 1.5, null, undefined, '5'])('rejects %p with the given message', value => {
        const result = schema.safeParse(value);

        expect(result.success).toBe(false);
        expect(result.error?.issues.map(issue => issue.message)).toEqual([MESSAGE]);
    });
});
