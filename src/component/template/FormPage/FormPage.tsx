import React, { ReactElement, useState } from 'react';

import { Alert, Box, Button, Grid, Group, LoadingOverlay, Stack, Text } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { IconArrowBack, IconDeviceFloppy, IconInfoCircle } from '@tabler/icons-react';

import { SaveDataSource } from '../../../data/SaveDataSource';
import { FormAction } from '../../../i18n/KitMessages';
import { Identifiable } from '../../../model/Identifiable';
import { useDocumentTitle, useKitConfig } from '../../../provider/useKit';
import { formatValues } from '../../../util/TransformData';
import { showErrorNotification, showSuccessNotification } from '../../../util/Notifications';
import PaperCard from '../../molecule/PaperCard/PaperCard';
import PageHeader from '../../organism/PageHeader/PageHeader';
import { FormType } from './FormType';

interface FormPageProps<T extends Identifiable, D extends object, S extends SaveDataSource<T, D>> {
    /** Destination of the data (e.g. a service that accesses an API). */
    service: S;

    /** Name of the record (e.g. "Region"), shown after the action verb in the title. */
    title: string;
    formType: FormType;
    form: UseFormReturnType<D & Identifiable>;

    /** Page opened after saving and by the back button; absent for the first segment of the current path. */
    backRoute?: string;

    /** Shows a loading overlay over the form (e.g. while the record is fetched). */
    isLoading?: boolean;

    /** Whether the form takes the whole width, instead of half of it on large screens. */
    isFullWidth?: boolean;
}

/** Action of each form type, the key of its verb in the texts. */
const FORM_ACTIONS: Record<FormType, FormAction> = {
    [FormType.Create]: 'create',
    [FormType.Edit]: 'edit',
    [FormType.View]: 'view'
};

/**
 * CRUD form page to create, edit or view a record (according to `formType`), which saves the data in `service` and
 * goes back to the list page.
 */
function FormPage<T extends Identifiable, D extends object, S extends SaveDataSource<T, D>>(
    props: React.PropsWithChildren<FormPageProps<T, D, S>>
): ReactElement {
    const { title, formType, service, form, backRoute, isLoading, isFullWidth, children } = props;
    const { router, messages } = useKitConfig();
    const { Link } = router;
    const navigate = router.useNavigate();
    const pathname = router.usePathname();

    /**
     * Checks whether a field of the validation schema is missing in the form.
     * @param fieldName name of the field to find
     */
    function isFormFieldMissing(fieldName: string): boolean {
        return !form.getInputNode(fieldName);
    }

    /**
     * Shows the errors of the fields that are in the validation schema given to `useForm`, but not in the form.
     * Without it, these errors are not shown to the user (not even in the console), so neither the user nor the
     * developer can understand why the form is not submitted.
     */
    function showErrorsForMissingFormFields(): ReactElement | false {
        const errors = Object.entries(form.errors)
            .map(([fieldName, errorMsg]) => ({ fieldName, errorMsg }))
            .filter(({ fieldName }) => isFormFieldMissing(fieldName))
            .map(({ fieldName, errorMsg }) => <li key={fieldName}>{errorMsg}</li>);

        const icon = <IconInfoCircle />;
        return (
            errors.length > 0 && (
                <Alert color="red" icon={icon}>
                    <ul>{errors}</ul>
                </Alert>
            )
        );
    }

    const { id } = form.values;

    const [loading, setLoading] = useState(false);
    const effectiveBackRoute = backRoute || `/${pathname.split('/').at(1)}`;

    const canShowSubmitButton = formType === FormType.Create || formType === FormType.Edit;
    const formTypeTitle = messages.form.action[FORM_ACTIONS[formType] ?? 'custom'];
    const documentTitle = useDocumentTitle(`${formTypeTitle} ${title}`);

    const handleSubmit = async (data: D) => {
        setLoading(true);
        try {
            const effectiveData = formatValues(data) as D;
            await service.save(id, effectiveData);
            showSuccessNotification(messages.form.saveSuccess(formTypeTitle), messages.common.success);

            if (effectiveBackRoute) navigate(effectiveBackRoute);
        } catch (e) {
            showErrorNotification(e, messages.form.saveError(formTypeTitle), messages.common.error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <title>{documentTitle}</title>
            <Stack gap="lg">
                <PageHeader
                    title={`${formTypeTitle} ${title}`}
                    breadcrumbItems={[
                        { title, href: effectiveBackRoute },
                        { title: `${formTypeTitle} ${title}`, href: '#' }
                    ]}
                />
                <Grid>
                    <Grid.Col span={{ base: 12, lg: isFullWidth ? 12 : 6 }}>
                        <PaperCard>
                            <Box component="form" onSubmit={form.onSubmit(handleSubmit)} pos="relative">
                                <LoadingOverlay
                                    visible={isLoading}
                                    zIndex={1000}
                                    overlayProps={{ radius: 'sm', blur: 2 }}
                                />

                                <Stack>
                                    <Text size="lg" fw={600}>
                                        {formTypeTitle} {title}
                                    </Text>

                                    {children}
                                    {showErrorsForMissingFormFields()}

                                    <Group>
                                        <Button
                                            leftSection={<IconArrowBack size={16} />}
                                            component={Link}
                                            href={effectiveBackRoute}
                                            variant="default"
                                        >
                                            {messages.common.back}
                                        </Button>
                                        {canShowSubmitButton && (
                                            <Button
                                                type="submit"
                                                leftSection={<IconDeviceFloppy size={16} />}
                                                loading={loading}
                                            >
                                                {formTypeTitle}
                                            </Button>
                                        )}
                                    </Group>
                                </Stack>
                            </Box>
                        </PaperCard>
                    </Grid.Col>
                </Grid>
            </Stack>
        </>
    );
}

export default FormPage;
