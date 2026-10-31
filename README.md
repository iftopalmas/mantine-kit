# @ifto/mantine-kit

[![Build](https://github.com/iftopalmas/mantine-kit/actions/workflows/build.yml/badge.svg)](https://github.com/iftopalmas/mantine-kit/actions/workflows/build.yml)
[![npm](https://img.shields.io/npm/v/@ifto/mantine-kit)](https://www.npmjs.com/package/@ifto/mantine-kit)
[![Storybook](https://img.shields.io/badge/docs-Storybook-ff4785)](https://iftopalmas.github.io/mantine-kit/)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

General purpose [Mantine](https://mantine.dev) components for business React apps: CRUD tables and forms, an app
layout with a side menu, [Apache ECharts](https://echarts.apache.org) charts, Excel/CSV export, print-ready reports and
a REST HTTP client.

- **Works with any router.** Components never import a router: they navigate through a small adapter you give to the
  `KitProvider` (examples for Next.js and React Router below). Without one, plain links are used.
- **Internationalized.** Every text comes from a typed message catalog, with American English (`en-US`, the default)
  and Brazilian Portuguese (`pt-BR`). Numbers, dates and sorting follow the locale. You can override any text.
- **Bound to data by contracts, not classes.** Tables and forms accept any object with `findAll`/`delete` or `save`
  methods, so they work with REST services, GraphQL clients or in-memory data alike.
- **Pay only for what you use.** Each component is imported from its own file, so optional dependencies (ECharts,
  ExcelJS, Axios, mantine-datatable) only enter your bundle if you use the components that need them. ECharts and
  ExcelJS are loaded on demand.
- **Ready for the Next.js App Router.** Every module is marked as a Client Component.

**Documentation of every component, with live examples: [Storybook](https://iftopalmas.github.io/mantine-kit/).**

## Contents

- [How to use](#how-to-use)
- [Examples](#examples)
- [Configuration](#configuration)
- [Components](#components)
- [Internationalization](#internationalization)
- [Storybook](#storybook)
- [Development](#development)
- [Publishing](#publishing)

## How to use

**1. Install** the library and its required peer dependencies:

```bash
yarn add @ifto/mantine-kit @mantine/core @mantine/hooks @mantine/dates @mantine/form @mantine/modals \
  @mantine/notifications @tabler/icons-react clsx dayjs react react-dom
```

Install the optional ones only if you use the components that need them:

| Package | Needed by |
|---|---|
| `mantine-datatable` | `Table`, `ViewTable`, `ListPage` |
| `echarts` | `EChart` and the chart types |
| `exceljs` | Excel export |
| `axios` | `AxiosHttpClient` |
| `zod` | `selectedId` validation helper |

**2. Import the CSS** once, after the Mantine CSS (e.g. in the root layout of the app):

```ts
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import 'mantine-datatable/styles.css';
import '@ifto/mantine-kit/styles.css';
import '@ifto/mantine-kit/print.css'; // only if you use PrintPage
```

**3. Wrap the app** with the Mantine providers and the `KitProvider`:

```tsx
import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import { KitProvider } from '@ifto/mantine-kit/provider/KitProvider';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <MantineProvider>
            <ModalsProvider>
                <Notifications />
                <KitProvider appName="My System" locale="en-US">
                    {children}
                </KitProvider>
            </ModalsProvider>
        </MantineProvider>
    );
}
```

Give your router to the `KitProvider` (`router={nextRouter}`) so links do not reload the page; see
[Router adapter](#router-adapter).

**4. Import each component from its own file** and use it:

```tsx
import { SelectField } from '@ifto/mantine-kit/component/molecule/SelectField/SelectField';

<SelectField label="City" data={cities} getId={city => city.id} getDescription={city => city.name} />;
```

The path is the one of the file inside `src`, without the extension (see [Components](#components)). There is no
`index` with everything, so you only bundle what you import.

## Examples

### CRUD list page

`ListPage` shows the records in a sortable, paginated table with view, edit and delete actions. Its `service` is any
object with `findAll` and `delete`:

```tsx
import ListPage from '@ifto/mantine-kit/component/template/ListPage/ListPage';
import type { ListDataSource } from '@ifto/mantine-kit/data/ListDataSource';

type Region = { id?: number; name: string };

const regions: ListDataSource<Region> = {
    findAll: () => fetch('/api/region').then(response => response.json()),
    delete: id => fetch(`/api/region/${id}`, { method: 'DELETE' }).then(() => undefined)
};

export function RegionsPage() {
    return (
        <ListPage
            title="Regions"
            titlePlural="Regions"
            breadcrumbItems={[{ title: 'Regions', href: '/region' }]}
            addActionRoute="/region/create"
            service={regions}
            resourceBasePath="/region"
            tableColumns={[{ accessor: 'name', title: 'Name', sortable: true }]}
        />
    );
}
```

### CRUD form page

`FormPage` creates, edits or views a record and saves it with any object that has a `save(id, data)` method:

```tsx
import { TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import FormPage from '@ifto/mantine-kit/component/template/FormPage/FormPage';
import { FormType } from '@ifto/mantine-kit/component/template/FormPage/FormType';
import type { SaveDataSource } from '@ifto/mantine-kit/data/SaveDataSource';

const regionService: SaveDataSource<Region, Region> = {
    save: (id, data) =>
        fetch(id ? `/api/region/${id}` : '/api/region', {
            method: id ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).then(response => response.json())
};

export function NewRegionPage() {
    const form = useForm<Region>({ initialValues: { name: '' } });

    return (
        <FormPage service={regionService} title="Region" form={form} formType={FormType.Create} backRoute="/region">
            <TextInput label="Name" {...form.getInputProps('name')} />
        </FormPage>
    );
}
```

To read the action from a catch-all route (`/region/create`, `/region/edit/5`), use
`parseActionsPageParams(segments)` (`util/parseActionsPageParams`).

### App layout with a side menu

```tsx
import { Menu, Title } from '@mantine/core';
import { IconHome, IconMap } from '@tabler/icons-react';
import { Layout } from '@ifto/mantine-kit/component/template/Layout/Layout';

const menu = [
    { link: '/', label: 'Home', icon: IconHome },
    { link: '/region', label: 'Regions', icon: IconMap }
];

export function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <Layout logo={<Title order={4}>My System</Title>} navItems={menu} userMenu={<Menu.Item>Log out</Menu.Item>}>
            {children}
        </Layout>
    );
}
```

### Chart

`EChart` builds the series from your data with `getName`/`getValue`. ECharts is loaded only when a chart is shown:

```tsx
import { EChart } from '@ifto/mantine-kit/component/organism/EChart/EChart';

const coverage = [
    { region: 'North', rate: 0.82 },
    { region: 'South', rate: 0.64 }
];

<EChart
    data={coverage}
    getName={item => item.region}
    getValue={item => item.rate}
    option={{ xAxis: { type: 'category', data: coverage.map(item => item.region) }, yAxis: {}, series: [{ type: 'bar' }] }}
    style={{ height: 360 }}
/>;
```

The chart types in `component/organism/EChart/chart` (`LINE_CHART`, `BAR_CHART`, `STACKED_BAR_CHART`, `DONUT_CHART`)
build a complete option, with one panel per unit, from generic series:
`option={LINE_CHART.buildOption(data, { title: 'Revenue', locale: 'en-US' })}`.

### Export to Excel or CSV

```tsx
import ExportMenuButton from '@ifto/mantine-kit/component/molecule/ExportMenuButton/ExportMenuButton';
import { downloadExport } from '@ifto/mantine-kit/export/ExportDownload';
import { EXPORT_FORMATS } from '@ifto/mantine-kit/export/ExportFormats';

<ExportMenuButton
    formats={EXPORT_FORMATS}
    onExport={format =>
        downloadExport(
            {
                title: 'Sales report',
                fileName: 'sales',
                info: [{ label: 'Period', value: '2026' }],
                generatedAt: new Date(),
                branding: { systemName: 'My System', siteUrl: window.location.origin },
                sheets: [{ name: 'Sales', columns: [{ header: 'Product' }, { header: 'Total' }], rows: [['Water', 10]] }],
                locale: 'en-US'
            },
            format
        )
    }
/>;
```

The CSV uses the decimal separator of the locale and a column separator that does not clash with it (`;` in `pt-BR`,
`,` in `en-US`), as Excel in that language expects.

The menu offers the formats you give: the built-in ones (`EXPORT_FORMATS`, `XLSX_FORMAT`, `CSV_FORMAT`), an Excel
format with your brand colors (`new XlsxFormat({ colors: { primary: 'FF2B8A3E' } })`) or any format of your own, by
implementing the `ExportFormat` interface (e.g. PDF or JSON).

### Printable report

```tsx
import PrintSection from '@ifto/mantine-kit/component/molecule/PrintSection/PrintSection';
import PrintPage from '@ifto/mantine-kit/component/template/PrintPage/PrintPage';

<PrintPage title="Regions report" systemName="My System" info={[{ label: 'Period', value: '2026' }]}>
    <PrintSection title="Regions">{regionsTable}</PrintSection>
    <PrintSection title="Summary" newPage>
        {summary}
    </PrintSection>
</PrintPage>;
```

### HTTP client

```ts
import { AxiosHttpClient } from '@ifto/mantine-kit/http/AxiosHttpClient';
import { ApiError } from '@ifto/mantine-kit/http/ApiError';

const httpClient = new AxiosHttpClient({ baseURL: 'https://api.example.com', timeout: 10_000, locale: 'en-US' });
// Interceptors, e.g. for the authentication token
httpClient.axiosInstance.interceptors.request.use(config => config);

try {
    await httpClient.put('/region/1', data);
} catch (e) {
    if (e instanceof ApiError && e.code === 'CONCURRENT_UPDATE') {
        // another user changed the record
    }
}
```

By default, the message and the code of an error are read from the `message` and `code` fields of the response body
(the error format of a Spring API). For another format, give an `errorParser` in the configuration.

More examples, with every state of each component, are in the [Storybook](https://iftopalmas.github.io/mantine-kit/).

## Configuration

Options of the `KitProvider`:

| Option | Default | Description |
|---|---|---|
| `router` | plain `<a>` links | Adapter to the router of the app (see below). |
| `appName` | none | Shown in the browser tab title by the page templates (e.g. "Regions - My System"). |
| `locale` | `en-US` | Language of the texts and format of numbers and dates: `en-US` or `pt-BR`. |
| `messages` | none | Texts that replace the ones of the locale, by section (see [Internationalization](#internationalization)). |
| `formRouteSegments` | `create`, `edit`, `view` | URL segments of the create, edit and view pages of a record (e.g. `/region/edit/5`), independent of the locale: `ENGLISH_FORM_ROUTE_SEGMENTS` (default), `PORTUGUESE_FORM_ROUTE_SEGMENTS` (`criar`, `editar`, `visualizar`) or your own, from `router/FormRouteSegments`. |

### Router adapter

A `RouterAdapter` has a `Link` component (receiving `href`), a `usePathname` hook and a `useNavigate` hook.

**Next.js (App Router):**

```tsx
'use client';

import NextLink from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import type { RouterAdapter } from '@ifto/mantine-kit/router/RouterAdapter';

export const nextRouter: RouterAdapter = {
    Link: NextLink,
    usePathname,
    useNavigate: () => useRouter().push
};
```

**React Router:**

```tsx
import { forwardRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';

import type { RouterAdapter, RouterLinkProps } from '@ifto/mantine-kit/router/RouterAdapter';

const RouterLink = forwardRef<HTMLAnchorElement, RouterLinkProps>(({ href, ...props }, ref) => (
    <Link ref={ref} to={href} {...props} />
));

export const reactRouter: RouterAdapter = {
    Link: RouterLink,
    usePathname: () => useLocation().pathname,
    useNavigate: () => {
        const navigate = useNavigate();
        return (url: string) => navigate(url);
    }
};
```

## Components

Every file is imported by its path inside `src`, without the extension, e.g.
`@ifto/mantine-kit/component/organism/Table/Table`. The components follow the
[atomic design](https://atomicdesign.bradfrost.com) layers.

### Atoms (`component/atom`)

| Component | What it does |
|---|---|
| `AppMain` | Main content area of the `Layout`, with the page background in light and dark color schemes. |
| `CancelEditButton` | Icon button that cancels the in-place editing of a table row. |
| `ConfirmEditButton` | Icon button that confirms the in-place editing of a table row (keeps its tooltip when disabled). |
| `EditValueButton` | Icon button that starts the in-place editing of a table row. |
| `DateField` | Clearable date input in the date format of the locale. |
| `ErrorAlert` | Red alert that shows an error message. |
| `Surface` | Polymorphic container, the base of cards and page headers. |

### Molecules (`component/molecule`)

| Component | What it does |
|---|---|
| `Breadcrumb` | Navigation path to the current page, with links to the previous ones. |
| `ExportMenuButton` | "Export" button with a menu of file formats (Excel, CSV); shows a notification if the export fails. |
| `PaperCard` | Bordered card that groups the content of a page. |
| `PrintSection` | Titled section of a report that can start on a new printed page and never leaves its title alone. |
| `SelectField` | Select built from any array of objects, with placeholder and "not found" texts built from the label. |
| `StatsCard` | Card with a key value, its change from the previous period and the period. |

### Organisms (`component/organism`)

| Component | What it does |
|---|---|
| `DataForm` | Form in a card with back and submit buttons, optional confirmation, notifications and navigation. |
| `DataTabList` | Tabs built from an array of objects, one tab per object, wrapping in rows. |
| `EChart` | React wrapper of Apache ECharts: builds the series from raw data, loads ECharts on demand, resizes and prints. |
| `Navbar` | Side menu with links and collapsible groups, highlighting the current page. |
| `PageHeader` | Page title with the breadcrumb and, in list pages, the "Add" button. |
| `StatsGrid` | Responsive grid of `StatsCard`s, with placeholders while loading. |
| `Table` | Table of the records of a data source, with view, edit and delete (with confirmation) actions. |
| `RowActions` | View, edit and delete buttons of a `Table` row. |
| `ViewTable` | Sortable and paginated table (on top of mantine-datatable), with locale-aware sorting. |

The `EChart/chart` folder has chart types that build the ECharts option from generic series: `LineChart`, `BarChart`
(negative values highlighted), `StackedBarChart` and `DonutChart`, with one panel per unit of measure.

### Templates (`component/template`)

| Component | What it does |
|---|---|
| `Layout` | App shell: header with the brand, color scheme toggle and user menu, collapsible side menu and content area. |
| `ListPage` | List page of records: header with the "Add" button, optional filters and the `Table`. |
| `FormPage` | Create, edit or view form page that saves the record in a `SaveDataSource`. |
| `CreateFormPage` | Form page to create a record with a given function. |
| `EditFormPage` | Form page to update a record with a given function. |
| `ViewPage` | Page that shows a record, with a back button. |
| `PrintPage` | Report page formatted to be printed or saved as PDF by the browser. |

### Other modules

| Module | What it does |
|---|---|
| `provider/KitProvider`, `provider/useKit` | Configuration of the library (router, app name, locale, texts) and the hooks to read it. |
| `router/RouterAdapter`, `router/anchorRouter` | Contract of the router adapter and the default one, with plain links. |
| `data/ListDataSource`, `data/SaveDataSource` | Contracts of the data sources of the tables and forms. |
| `i18n/*` | Message catalog type, the `en-US` and `pt-BR` catalogs and `resolveMessages`. |
| `export/*` | Export model (`ExportDocument`), the Excel and CSV formats and `downloadExport`. |
| `http/AxiosHttpClient`, `http/ApiError` | REST client that turns backend errors into `ApiError`s with message and code. |
| `hook/*` | `useService` and `useKeyedService` (fetch data, ignoring stale responses), `useIsMobile`, `useLightColorSchemeOnPrint`. |
| `util/*` | Notifications, sorting, number and date formatting, URL building, form helpers and more. |

## Internationalization

All texts the components show are in a typed catalog (`i18n/KitMessages.ts`), grouped by component: `common`, `form`,
`table`, `rowEdit`, `select`, `layout`, `print`, `stats`, `export`, `chart` and `http`. Each locale is an object of
this type (`i18n/messages/ptBR.ts`, `i18n/messages/enUS.ts`), so a missing translation is a compile error. Texts with
variables are functions, such as `table.pagination({ from, to, totalRecords })`.

Choose the locale and override any text in the `KitProvider`. An app that already uses an i18n library (e.g.
`react-i18next`, `next-intl`) passes its translations the same way:

```tsx
<KitProvider locale="en-US" messages={{ common: { back: t('back') }, table: { noRecords: t('empty') } }}>
```

Code outside React receives the locale (and, optionally, texts) directly: `ExportDocument.locale`,
`ChartContext.locale` and `AxiosHttpClientConfig.locale`. URLs are not translated: the CRUD route segments are a
separate option (`formRouteSegments`).

## Storybook

The [Storybook](https://iftopalmas.github.io/mantine-kit/) documents every component: a **Docs** page per component,
generated from its props types and JSDoc, and stories with examples of its states, whose props can be changed in the
**Controls** panel. The toolbar switches the locale (`en-US`/`pt-BR`) and the theme (light/dark) of all stories.

```bash
yarn storybook         # development server at http://localhost:6006
yarn storybook:build   # static site in storybook-static/
```

The stories live in `stories/`, mirroring `src/`. The [`storybook.yml`](.github/workflows/storybook.yml) workflow
publishes the site to GitHub Pages on every push to `main`.

## Development

See [AGENTS.md](AGENTS.md) for the architecture and the conventions of the code.

```bash
nvm use          # Node version of .nvmrc
corepack enable
yarn install
yarn test    # Prettier, lint, typecheck and tests with coverage
yarn build   # generates dist/
```

## Publishing

The [`publish.yml`](.github/workflows/publish.yml) workflow publishes to npm when a tag equal to the version in
`package.json` is pushed:

```bash
# After updating "version" in package.json and merging it into main
git tag v0.1.0
git push origin v0.1.0
```

Versions with a suffix (e.g. `v0.2.0-beta.1`) are published with the `next` dist-tag. The workflow needs the
`NPM_TOKEN` secret (an npm granular access token allowed to publish in the `@ifto` scope) in the `npm` environment of
the repository.

## License

[MIT](LICENSE)
