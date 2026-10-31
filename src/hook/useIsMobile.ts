import { useMediaQuery } from '@mantine/hooks';

/** Maximum screen width considered a mobile device. */
const MOBILE_MEDIA_QUERY = '(max-width: 768px)';

/**
 * Tells whether the user is on a mobile device.
 * @return true if the screen has the width of a mobile device, false otherwise
 */
export const useIsMobile = () => {
    const isMobile = useMediaQuery(MOBILE_MEDIA_QUERY);

    /* `useMediaQuery` returns `undefined` before the first measurement. The caller expects just true or false, so it is
       treated as false. */
    return isMobile == undefined ? false : isMobile;
};
