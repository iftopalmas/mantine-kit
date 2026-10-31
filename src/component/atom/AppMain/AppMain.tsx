import { ReactNode } from 'react';

import { Box } from '@mantine/core';

import classes from './App.module.css';

type AppMainProps = {
    children: ReactNode;
};

/** Main content area of the {@link Layout}, with the page background in the light and dark color schemes. */
const AppMain = ({ children }: AppMainProps) => (
    <Box p={0} className={classes.main}>
        {children}
    </Box>
);

export default AppMain;
