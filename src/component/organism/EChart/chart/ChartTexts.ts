import { DEFAULT_LOCALE } from '../../../../i18n/KitLocale';
import { ChartMessages } from '../../../../i18n/KitMessages';
import { resolveMessages } from '../../../../i18n/resolveMessages';
import { ChartContext } from './ChartType';

/**
 * Returns the texts of a chart: the ones of its locale, with the ones the context overrides.
 * @param context context of the chart
 */
export function chartMessages(context: Pick<ChartContext, 'locale' | 'messages'>): ChartMessages {
    return resolveMessages(context.locale, { chart: context.messages }).chart;
}

/**
 * Returns the locale of a chart.
 * @param context context of the chart
 */
export function chartLocale(context: Pick<ChartContext, 'locale'>): string {
    return context.locale ?? DEFAULT_LOCALE;
}
