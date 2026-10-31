import React, { FormEvent, ReactElement, useState } from 'react';

import { Box, Button, Grid, Group, Stack, Text } from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';
import { modals } from '@mantine/modals';
import { IconArrowBack, IconDeviceFloppy } from '@tabler/icons-react';

import { useKitConfig } from '../../../provider/useKit';
import { formatValues } from '../../../util/TransformData';
import { errorMessage, showErrorNotification, showSuccessNotification } from '../../../util/Notifications';
import PaperCard from '../../molecule/PaperCard/PaperCard';

/** Props of the submit button. */
interface SubmitProps {
    title: string;
    successMsg?: string;
    errorMsg: string;
    disabled?: boolean;

    /** Question shown in a confirmation dialog before submitting; absent to submit right away. */
    confirmationMessage?: string;
}

interface FormProps<D extends object> {
    title: string;

    /** Page opened after the data is saved and by the back button; absent for no back button nor navigation. */
    backRoute?: string;

    /** Sends the form data (e.g. to the API). */
    fetchMethod: (data: D) => Promise<unknown>;
    form: UseFormReturnType<D>;
    submit: SubmitProps;
}

/**
 * Form in a card, with the back and submit buttons. On submit, calls `fetchMethod` (optionally after a confirmation),
 * shows a notification and goes back to `backRoute`, if given.
 */
function DataForm<D extends object>(props: React.PropsWithChildren<FormProps<D>>): ReactElement {
    const { title, backRoute, fetchMethod, form, children, submit } = props;
    const { router, messages } = useKitConfig();
    const navigate = router.useNavigate();
    const { Link } = router;

    const [loading, setLoading] = useState(false);

    const handleSubmit = async (data: D, evt: FormEvent<HTMLFormElement> | undefined) => {
        setLoading(true);
        try {
            const effectiveData = formatValues(data) as D;
            await fetchMethod(effectiveData);
            submit.successMsg && showSuccessNotification(submit.successMsg, messages.common.success);

            backRoute && navigate(backRoute);
        } catch (error) {
            showErrorNotification(error, `${submit.errorMsg}: ${errorMessage(error)}`, messages.common.error);
        } finally {
            setLoading(false);
        }

        !backRoute && evt?.preventDefault();
    };

    const openModal = async () =>
        modals.openConfirmModal({
            title: messages.form.confirmTitle,
            centered: true,
            children: <Text size="sm">{submit.confirmationMessage}</Text>,
            labels: { confirm: messages.common.confirm, cancel: messages.common.cancel },
            onConfirm: async () => await handleSubmit(form.values, undefined)
        });

    return (
        <Grid>
            <Grid.Col span={{ base: 12, lg: 12 }}>
                <PaperCard>
                    <Box
                        component="form"
                        onSubmit={form.onSubmit(submit.confirmationMessage ? openModal : handleSubmit)}
                    >
                        <Stack>
                            <Text size="lg" fw={600}>
                                {title}
                            </Text>

                            {children}

                            <Group>
                                {backRoute && (
                                    <Button
                                        leftSection={<IconArrowBack size={16} />}
                                        component={Link}
                                        href={backRoute}
                                        variant="default"
                                    >
                                        {messages.common.back}
                                    </Button>
                                )}
                                <Button
                                    type="submit"
                                    leftSection={<IconDeviceFloppy size={16} />}
                                    loading={loading}
                                    disabled={submit.disabled}
                                >
                                    {submit.title}
                                </Button>
                            </Group>
                        </Stack>
                    </Box>
                </PaperCard>
            </Grid.Col>
        </Grid>
    );
}

export default DataForm;
