import React, { ReactElement } from 'react';

import { Box, Button, Grid, Stack, Text } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';

import { useDocumentTitle, useKitConfig } from '../../../provider/useKit';
import { BreadcrumbItem } from '../../molecule/Breadcrumb/Breadcrumb';
import PaperCard from '../../molecule/PaperCard/PaperCard';
import PageHeader from '../../organism/PageHeader/PageHeader';

interface ViewPageProps {
    /** Name of the record (e.g. "Region"). */
    title: string;
    breadcrumbItems: BreadcrumbItem[];
    backRoute: string;
}

/** Page that shows a record, with the given content and the back button. */
function ViewPage(props: React.PropsWithChildren<ViewPageProps>): ReactElement {
    const { title, breadcrumbItems, backRoute, children } = props;
    const { router, messages } = useKitConfig();
    const { Link } = router;
    const pageTitle = `${messages.form.action.view} ${title}`;
    const documentTitle = useDocumentTitle(pageTitle);

    return (
        <>
            <title>{documentTitle}</title>
            <Stack gap="lg">
                <PageHeader title={pageTitle} breadcrumbItems={[...breadcrumbItems, { title: pageTitle, href: '#' }]} />
                <Grid>
                    <Grid.Col span={{ base: 12, lg: 12 }}>
                        <PaperCard>
                            <Stack>
                                <Text size="lg" fw={600}>
                                    {pageTitle}
                                </Text>

                                {children}

                                <Box>
                                    <Button leftSection={<IconArrowBack size={16} />} component={Link} href={backRoute}>
                                        {messages.common.back}
                                    </Button>
                                </Box>
                            </Stack>
                        </PaperCard>
                    </Grid.Col>
                </Grid>
            </Stack>
        </>
    );
}

export default ViewPage;
