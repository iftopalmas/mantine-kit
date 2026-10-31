import React, { ReactElement } from 'react';

import { Stack } from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';

import { Identifiable } from '../../../model/Identifiable';
import { useDocumentTitle, useKitMessages } from '../../../provider/useKit';
import { BreadcrumbItem } from '../../molecule/Breadcrumb/Breadcrumb';
import DataForm from '../../organism/DataForm/DataForm';
import PageHeader from '../../organism/PageHeader/PageHeader';

interface EditFormPageProps<T extends Identifiable, D extends object> {
    /** Name of the record (e.g. "Region"). */
    title: string;
    breadcrumbItems: BreadcrumbItem[];

    /** Sends the changed data of the record (e.g. to the API). */
    fetchMethod: (data: D) => Promise<T>;
    form: UseFormReturnType<D>;
    backRoute: string;
    isSubmitDisabled?: boolean;

    /** Question shown in a confirmation dialog before saving; absent to save right away. */
    confirmationMessage?: string;
}

/** Form page to update a record, which sends the data with `fetchMethod`. */
function EditFormPage<T extends Identifiable, D extends object>(
    props: React.PropsWithChildren<EditFormPageProps<T, D>>
): ReactElement {
    const { title, breadcrumbItems, fetchMethod, form, backRoute, isSubmitDisabled, children, confirmationMessage } =
        props;
    const messages = useKitMessages();
    const action = messages.form.action.edit;
    const pageTitle = `${action} ${title}`;
    const documentTitle = useDocumentTitle(pageTitle);

    return (
        <>
            <title>{documentTitle}</title>
            <Stack gap="lg">
                <PageHeader title={pageTitle} breadcrumbItems={[...breadcrumbItems, { title: pageTitle, href: '#' }]} />

                <DataForm
                    form={form}
                    fetchMethod={fetchMethod}
                    title={title}
                    backRoute={backRoute}
                    submit={{
                        title: action,
                        successMsg: messages.form.updateSuccess,
                        errorMsg: messages.form.updateError,
                        disabled: isSubmitDisabled,
                        confirmationMessage
                    }}
                >
                    {children}
                </DataForm>
            </Stack>
        </>
    );
}

export default EditFormPage;
