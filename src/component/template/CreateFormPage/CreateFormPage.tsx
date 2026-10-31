import React, { ReactElement } from 'react';

import { Stack } from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';

import { Identifiable } from '../../../model/Identifiable';
import { useDocumentTitle, useKitMessages } from '../../../provider/useKit';
import { BreadcrumbItem } from '../../molecule/Breadcrumb/Breadcrumb';
import DataForm from '../../organism/DataForm/DataForm';
import PageHeader from '../../organism/PageHeader/PageHeader';

interface CreateFormPageProps<T extends Identifiable, D extends object> {
    /** Name of the record (e.g. "Region"). */
    title: string;
    breadcrumbItems: BreadcrumbItem[];

    /** Sends the data of the new record (e.g. to the API). */
    fetchMethod: (data: D) => Promise<T>;
    form: UseFormReturnType<D>;
    backRoute: string;
    isSubmitDisabled?: boolean;

    /** Question shown in a confirmation dialog before saving; absent to save right away. */
    confirmationMessage?: string;
}

/** Form page to create a record, which sends the data with `fetchMethod`. */
function CreateFormPage<T extends Identifiable, D extends object>(
    props: React.PropsWithChildren<CreateFormPageProps<T, D>>
): ReactElement {
    const { title, breadcrumbItems, fetchMethod, form, backRoute, isSubmitDisabled, children, confirmationMessage } =
        props;
    const messages = useKitMessages();
    const pageTitle = `${messages.form.action.create} ${title}`;
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
                        title: messages.common.save,
                        successMsg: messages.form.createSuccess,
                        errorMsg: messages.form.createError,
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

export default CreateFormPage;
