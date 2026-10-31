import { ReactElement, ReactNode } from 'react';

import { PaperProps, SimpleGrid, Skeleton } from '@mantine/core';

import { useKitMessages } from '../../../provider/useKit';
import classes from './StatsGrid.module.css';
import ErrorAlert from '../../atom/ErrorAlert/ErrorAlert';
import StatsCard, { StatsCardData } from '../../molecule/StatsCard/StatsCard';

/** Number of placeholder cards shown while loading. */
const LOADING_CARDS = 4;

type StatsGridProps = {
    data?: StatsCardData[];
    paperProps?: PaperProps;
    error?: ReactNode;
    loading?: boolean;
};

/** Responsive grid of {@link StatsCard}s, with placeholders while loading and an alert on error. */
export default function StatsGrid({ data, loading, error, paperProps }: StatsGridProps): ReactElement {
    const messages = useKitMessages();
    const stats = data?.map(stat => <StatsCard key={stat.title} data={stat} {...paperProps} />);

    return (
        <div className={classes.root}>
            {error ? (
                <ErrorAlert title={messages.common.loadError} message={String(error)} />
            ) : (
                <SimpleGrid
                    cols={{ base: 1, sm: 2, lg: 4 }}
                    spacing={{ base: 10, sm: 'xl' }}
                    verticalSpacing={{ base: 'md', sm: 'xl' }}
                >
                    {loading
                        ? Array.from({ length: LOADING_CARDS }).map((_, i) => (
                              <Skeleton key={`stats-loading-${i}`} visible height={130} />
                          ))
                        : stats}
                </SimpleGrid>
            )}
        </div>
    );
}
