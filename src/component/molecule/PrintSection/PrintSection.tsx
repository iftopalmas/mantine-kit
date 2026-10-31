import { ReactElement, ReactNode, useId } from 'react';

import { Box, Title } from '@mantine/core';

type Props = {
    /** Title of the section. When printing, it is not left alone at the end of a page. */
    title: string;

    /** Whether the section starts on a new page, when printing. */
    newPage?: boolean;

    children: ReactNode;
};

/**
 * Section of a report ({@link PrintPage}), with a title. When printing, it may start on a new page (e.g. one topic
 * per page), and the title is not separated from the content.
 */
function PrintSection({ title, newPage = false, children }: Props): ReactElement {
    // Links the section to its title, so screen readers announce the section by name.
    const titleId = useId();

    return (
        <Box component="section" mb="xl" aria-labelledby={titleId} data-print-new-page={newPage || undefined}>
            <Title id={titleId} order={2} size="h3" mb="sm" data-print-keep-with-next>
                {title}
            </Title>
            {children}
        </Box>
    );
}

export default PrintSection;
