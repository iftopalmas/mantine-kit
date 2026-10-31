'use client';

import { Button, Divider, Flex, Paper, PaperProps, Stack, Title } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';

import { useKitConfig } from '../../../provider/useKit';
import Surface from '../../atom/Surface/Surface';
import Breadcrumb, { BreadcrumbItem } from '../../molecule/Breadcrumb/Breadcrumb';

type PageHeaderProps = {
    title: string;
    breadcrumbItems?: BreadcrumbItem[];

    /** Route of the "Add" button. Without it, the page has no "Add" button. */
    addActionRoute?: string;
} & PaperProps;

/**
 * Header of a page: the title, the breadcrumb and, in list pages, the "Add" button. With the button, the breadcrumb
 * starts at the home page.
 */
const PageHeader = (props: PageHeaderProps) => {
    const { breadcrumbItems, title, addActionRoute, ...others } = props;
    const { router, messages } = useKitConfig();
    const { Link } = router;

    return (
        <>
            <Surface component={Paper} style={{ backgroundColor: 'transparent' }} {...others}>
                {addActionRoute ? (
                    <Flex
                        align="center"
                        justify="space-between"
                        direction={{ base: 'row', sm: 'row' }}
                        gap={{ base: 'sm', sm: 4 }}
                    >
                        <Stack>
                            <Title order={3}>{title}</Title>
                            <Breadcrumb
                                items={[{ title: messages.common.home, href: '/' }, ...(breadcrumbItems ?? [])]}
                            />
                        </Stack>

                        <Button leftSection={<IconPlus size={18} />} component={Link} href={addActionRoute}>
                            {messages.common.add}
                        </Button>
                    </Flex>
                ) : (
                    <Stack gap="sm">
                        <Title order={3}>{title}</Title>
                        <Breadcrumb items={breadcrumbItems ?? []} />
                    </Stack>
                )}
            </Surface>
            <Divider />
        </>
    );
};

export default PageHeader;
