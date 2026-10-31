import { ReactElement } from 'react';
import { useForm } from '@mantine/form';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import DataForm from '@/src/component/organism/DataForm/DataForm';
import FormPage from '@/src/component/template/FormPage/FormPage';
import { FormType } from '@/src/component/template/FormPage/FormType';
import { SaveDataSource } from '@/src/data/SaveDataSource';
import { createTestRouter, render } from '@/test-utils';

jest.mock('@/src/util/Notifications', () => ({
    showSuccessNotification: jest.fn(),
    showErrorNotification: jest.fn()
}));
jest.mock('@mantine/notifications', () => ({ showNotification: jest.fn() }));
jest.mock('@/src/component/molecule/PaperCard/PaperCard', () => ({
    __esModule: true,
    default: ({ children }: React.PropsWithChildren) => <div>{children}</div>
}));
jest.mock('@/src/component/organism/PageHeader/PageHeader', () => ({ __esModule: true, default: () => null }));

/** Item of a list of the form, which must reach the destination as a list, and not as an object. */
type Item = { id: number; name: string; order: number };

/** Data of the test form, with a list of objects. */
type Group = { id?: number; name: string; items: Item[] };

const existingItems: Item[] = [{ id: 3, name: 'Test item', order: 1 }];

interface TestFormProps {
    component: 'FormPage' | 'DataForm';
    editing: boolean;
    service: SaveDataSource<Group, Group>;
}

function TestForm({ component, editing, service }: TestFormProps): ReactElement {
    const form = useForm<Group>({
        initialValues: {
            id: editing ? 1 : undefined,
            name: 'Test group',
            items: editing ? existingItems : []
        }
    });

    return component === 'FormPage' ? (
        <FormPage service={service} title="Group" form={form} formType={editing ? FormType.Edit : FormType.Create} />
    ) : (
        <DataForm
            title="Group"
            form={form}
            fetchMethod={data => service.save(form.values.id, data)}
            submit={{ title: 'Salvar', errorMsg: 'Erro ao salvar' }}
        />
    );
}

describe.each(['FormPage', 'DataForm'] as const)('submission of arrays by the %s', component => {
    test.each([false, true])('keeps the lists in the sent data (editing: %s)', async editing => {
        const save = jest.fn<Promise<Group>, [Group['id'], Group]>().mockResolvedValue({ name: '', items: [] });
        const user = userEvent.setup();
        render(<TestForm component={component} editing={editing} service={{ save }} />, {
            router: createTestRouter('/group/criar').router
        });

        const buttonName = component === 'DataForm' ? 'Salvar' : editing ? 'Update' : 'Create';
        await user.click(screen.getByRole('button', { name: buttonName }));

        await waitFor(() => expect(save).toHaveBeenCalledTimes(1));
        expect(save).toHaveBeenCalledWith(editing ? 1 : undefined, {
            id: editing ? 1 : undefined,
            name: 'Test group',
            items: editing ? existingItems : []
        });
    });
});
