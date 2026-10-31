require('@testing-library/jest-dom');

/* The tests with `@jest-environment node` (e.g. the ones that read back an exported file) have no `window`. */
if (typeof window !== 'undefined') {
    const { getComputedStyle } = window;
    window.getComputedStyle = elt => getComputedStyle(elt);

    Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
            // An empty query matches any screen, as in the browser.
            matches: query === '',
            media: query,
            onchange: null,
            addListener: jest.fn(),
            removeListener: jest.fn(),
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            dispatchEvent: jest.fn()
        }))
    });

    class ResizeObserver {
        observe() {}
        unobserve() {}
        disconnect() {}
    }

    window.ResizeObserver = ResizeObserver;
    Element.prototype.scrollTo = jest.fn();
}
