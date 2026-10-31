'use client';

import { ReactNode } from 'react';

import { Paper, PaperProps } from '@mantine/core';

type PaperCardProps = { children: ReactNode };

const PAPER_PROPS: PaperProps = {
    p: 'md',
    radius: 'md',
    withBorder: true
};

/** Bordered card with padding and rounded corners, used to group the content of a page (e.g. a form or a table). */
const PaperCard = ({ children }: PaperCardProps) => <Paper {...PAPER_PROPS}>{children}</Paper>;

export default PaperCard;
