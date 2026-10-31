import { Badge, Group, Paper, PaperProps, Text } from '@mantine/core';
import { IconArrowDownRight, IconArrowUpRight } from '@tabler/icons-react';

import { useKitMessages } from '../../../provider/useKit';
import classes from './Stats.module.css';
import Surface from '../../atom/Surface/Surface';

/** Value of a {@link StatsCard}. */
export type StatsCardData = {
    title: string;
    value: string;

    /** Percentage change from the previous period (e.g. `12` for +12%). */
    diff: number;

    /** Period shown in a badge (e.g. "Monthly"). */
    period?: string;

    /** What the change is compared to (e.g. "Compared to last year"); absent for the text of the locale (last month). */
    comparison?: string;
};

type StatsCardProps = { data: StatsCardData } & PaperProps;

/** Card with a key value, its change from the previous period (up or down arrow) and the period. */
const StatsCard = ({ data, ...others }: StatsCardProps) => {
    const { title, value, period, diff, comparison } = data;
    const DiffIcon = diff > 0 ? IconArrowUpRight : IconArrowDownRight;
    const messages = useKitMessages().stats;

    return (
        <Surface component={Paper} {...others}>
            <Group justify="space-between">
                <Text size="xs" c="dimmed" className={classes.title}>
                    {title}
                </Text>
                {period && (
                    <Badge variant="filled" radius="sm">
                        {period}
                    </Badge>
                )}
            </Group>

            <Group align="flex-end" gap="xs" mt={25}>
                <Text className={classes.value}>{value}</Text>
                <Text c={diff > 0 ? 'teal' : 'red'} fz="sm" fw={500} className={classes.diff}>
                    <span>{diff}%</span>
                    <DiffIcon size="1rem" stroke={1.5} />
                </Text>
            </Group>

            <Text fz="xs" c="dimmed" mt={7}>
                {comparison ?? messages.comparedToLastMonth}
            </Text>
        </Surface>
    );
};

export default StatsCard;
