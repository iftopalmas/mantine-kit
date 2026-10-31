import { hideNotification, showNotification } from '@mantine/notifications';

import { DEFAULT_MESSAGES } from '../i18n/resolveMessages';

export { hideNotification };

/**
 * Shows a success message.
 * @param message message of the notification
 * @param title title of the notification; components give the one of their locale (`common.success`)
 * @return the id of the notification, to hide it later with {@link hideNotification}
 */
export function showSuccessNotification(message: string, title: string = DEFAULT_MESSAGES.common.success): string {
    return showNotification({
        withBorder: true,
        color: 'green',
        title,
        message
    });
}

/**
 * Shows a warning: something that did not go as expected, but is not an error (e.g. an action done only in part).
 * @param message message of the warning
 * @param title title of the warning; components give the one of their locale (`common.warning`)
 * @return the id of the notification, to hide it later with {@link hideNotification}
 */
export function showWarningNotification(message: string, title: string = DEFAULT_MESSAGES.common.warning): string {
    return showNotification({
        withBorder: true,
        color: 'yellow',
        title,
        message
    });
}

/**
 * Shows an error.
 * @param error error to show, used when there is no `message`
 * @param message message of the notification; if absent, the message of the error
 * @param title title of the notification; components give the one of their locale (`common.error`)
 * @return the id of the notification, to hide it later with {@link hideNotification}
 */
export function showErrorNotification(
    error: unknown,
    message?: string,
    title: string = DEFAULT_MESSAGES.common.error
): string {
    return showNotification({
        withBorder: true,
        color: 'red',
        title,
        message: message ?? errorMessage(error)
    });
}

/**
 * Returns the message of an error, to show to the user.
 * @param error the error, which may be an {@link Error}, an object with `message` or any other thrown value
 * @return the `message` attribute of the error, if any, or the error itself converted to text
 */
export function errorMessage(error: unknown): string {
    if (typeof error === 'object' && error !== null && 'message' in error) return String(error.message);
    return String(error);
}
