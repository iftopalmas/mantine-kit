import type { ChartTypeId } from '../component/organism/EChart/chart/ChartTypeId';

/** Pagination range shown below a table (e.g. "Showing 1 to 10 of 42 records"). */
export type PaginationRange = { from: number; to: number; totalRecords: number };

/** Action of a CRUD form, used to build its titles and messages. */
export type FormAction = 'create' | 'edit' | 'view' | 'custom';

/** Texts shared by many components. */
export type CommonMessages = {
    back: string;
    save: string;
    cancel: string;
    confirm: string;
    add: string;
    home: string;
    success: string;
    warning: string;
    error: string;

    /** Title of the alert shown when the data of a component cannot be loaded. */
    loadError: string;

    /** Date format of date fields, in Day.js tokens (e.g. `DD/MM/YYYY`). */
    dateFormat: string;
};

/** Texts of the CRUD form templates (`FormPage`, `CreateFormPage`, `EditFormPage`, `ViewPage`, `DataForm`). */
export type FormMessages = {
    /** Verb of each form action, used in titles and buttons (e.g. "Create", "Update"). */
    action: Record<FormAction, string>;

    /** Message shown after the record is saved, built from the action verb. */
    saveSuccess: (action: string) => string;

    /** Message shown when the record cannot be saved, built from the action verb. */
    saveError: (action: string) => string;

    createSuccess: string;
    createError: string;
    updateSuccess: string;
    updateError: string;

    /** Title of the confirmation dialog shown before submitting a form that asks for it. */
    confirmTitle: string;
};

/** Texts of the tables (`Table`, `ViewTable`, `ListPage`). */
export type TableMessages = {
    actions: string;
    view: string;
    edit: string;
    delete: string;
    deleteConfirm: string;
    deleteSuccess: string;
    noRecords: string;
    recordsPerPage: string;
    pagination: (range: PaginationRange) => string;

    /** Title of the card that holds the table of a list page, built from the plural name of the records. */
    listTitle: (pluralName: string) => string;
};

/** Tooltips of the buttons that edit a table row in place. */
export type RowEditMessages = {
    edit: string;
    confirm: string;
    cancel: string;
};

/** Texts of the `SelectField`. */
export type SelectMessages = {
    /** Placeholder built from the field label, when the field has no placeholder of its own. */
    placeholder: (label: string) => string;

    /** Text shown when no option matches the search, built from the field label. */
    nothingFound: (label: string) => string;
};

/** Texts of the `Layout` header and side menu. */
export type LayoutMessages = {
    userMenu: string;
    userMenuTitle: string;
    enableDarkTheme: string;
    enableLightTheme: string;
    collapseNavigation: string;
    expandNavigation: string;
};

/** Texts of the print pages (`PrintPage`). */
export type PrintMessages = {
    pdfTipTitle: string;
    pdfTip: string;
    printButton: string;
};

/** Texts of the stats cards (`StatsCard`, `StatsGrid`). */
export type StatsMessages = {
    comparedToLastMonth: string;
};

/** Texts of the exported files (Excel and CSV) and of the export button. */
export type ExportMessages = {
    button: string;

    /** Message shown when the export fails, built from the format name (e.g. "Excel (.xlsx)"). */
    failed: (formatLabel: string) => string;

    /** Date and time the data was generated, shown below the title (e.g. "Generated on 10/20/2026 at 2:30 PM"). */
    generatedAt: (date: Date) => string;

    /** Footer that tells which system generated the data. */
    footer: (systemName: string) => string;

    /**
     * Page number in the footer of the printed spreadsheet, with the Excel header/footer codes `&P` (page) and `&N`
     * (total pages).
     */
    excelPageNumber: string;

    /** Text of a cell whose value could not be computed. */
    invalidCell: string;

    /** File name used when the document name has no valid character. */
    defaultFileName: string;

    /** Sheet name used when the sheet has no valid name, built from its position (starting at 1). */
    defaultSheetName: (position: number) => string;
};

/** Texts of the charts. */
export type ChartMessages = {
    /** Name of each chart type, shown in a chart type selector. */
    types: Record<ChartTypeId, string>;

    /** Title of the button that saves the chart as an image. */
    saveAsImage: string;

    /** Subtitle of the donut chart with the formatted sum of the slices. */
    total: (formattedTotal: string) => string;
};

/** Messages of the HTTP client errors. */
export type HttpMessages = {
    /** The backend answered with an error, but without a message. */
    unknownError: string;

    /** The request was sent, but there was no answer (e.g. backend down or timeout). */
    noResponse: string;

    /** The request was not even sent and Axios gave no reason. */
    requestFailed: string;
};

/**
 * Every text the library shows to users, grouped by component. Each locale is an object of this type
 * (`messages/ptBR.ts`, `messages/enUS.ts`), so a missing translation is a compile error.
 */
export type KitMessages = {
    common: CommonMessages;
    form: FormMessages;
    table: TableMessages;
    rowEdit: RowEditMessages;
    select: SelectMessages;
    layout: LayoutMessages;
    print: PrintMessages;
    stats: StatsMessages;
    export: ExportMessages;
    chart: ChartMessages;
    http: HttpMessages;
};

/** Partial {@link KitMessages}, used by an app to override some texts of a locale. */
export type KitMessagesOverride = { [Section in keyof KitMessages]?: Partial<KitMessages[Section]> };
