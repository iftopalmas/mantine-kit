import { Tabs } from '@mantine/core';
import { IconTableColumn } from '@tabler/icons-react';
import { ReactElement, ReactNode } from 'react';

import type { Identifiable } from '../../../model/Identifiable';
import classes from './DataTabList.module.css';

type TabListProps<M extends Identifiable> = {
    /** One tab per object. */
    dataArray: M[];

    /** Returns the icon of the tab of an object; without it, all tabs use a generic icon. */
    tabIconFn?: (obj: M, tabIndex: number) => ReactNode;

    /** Index of the tab selected at first. */
    defaultTabIndex?: number;

    /** Value of the selected tab, to control it from outside (the id of the object, as a string). */
    value?: string | null;
    onChange?: (value: string | null) => void;

    /** Returns the title of the tab of an object. */
    tabTitleFn: (obj: M) => string;

    /** Returns the content of the tab of an object. */
    children: (obj: M, tabIndex: number) => ReactNode;
};

/**
 * Tabs built from an array of objects, one tab per object.
 * Each tab is as wide as its title (up to a maximum width, wrapping longer titles), and tabs that do not fit in a row
 * move to the next one, aligned to the left, keeping the same look.
 */
function DataTabList<M extends Identifiable>({
    dataArray,
    tabIconFn = () => <IconTableColumn />,
    tabTitleFn,
    defaultTabIndex = 0,
    value,
    onChange,
    children
}: TabListProps<M>): ReactElement {
    if (dataArray.length == 0) {
        return <></>;
    }

    const tabValue = (obj: M, index: number) => (obj.id || index).toString();

    return (
        <Tabs
            defaultValue={dataArray[defaultTabIndex]?.id?.toString()}
            value={value}
            onChange={onChange}
            variant="pills"
            classNames={{ tab: classes.tab, tabSection: classes.tabSection, panel: classes.panel }}
        >
            <Tabs.List>
                {dataArray.map((data, i) => (
                    <Tabs.Tab value={tabValue(data, i)} key={tabValue(data, i)} leftSection={tabIconFn(data, i)}>
                        {tabTitleFn(data)}
                    </Tabs.Tab>
                ))}
            </Tabs.List>

            {dataArray.map((data, i) => (
                <Tabs.Panel value={tabValue(data, i)} key={tabValue(data, i)}>
                    {children(data, i)}
                </Tabs.Panel>
            ))}
        </Tabs>
    );
}

export default DataTabList;
