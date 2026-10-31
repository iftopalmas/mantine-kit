'use client';

import { forwardRef, ReactNode } from 'react';

import { Box, BoxProps, createPolymorphicComponent, PaperProps } from '@mantine/core';

type SurfaceProps = { children: ReactNode } & BoxProps & PaperProps;

/** Polymorphic container (e.g. `component={Paper}`) used as the base of cards and page headers. */
const Surface = createPolymorphicComponent<'div', SurfaceProps>(
    forwardRef<HTMLDivElement, SurfaceProps>(({ children, ...others }, ref) => (
        <Box component="div" {...others} ref={ref}>
            {children}
        </Box>
    ))
);

export default Surface;
