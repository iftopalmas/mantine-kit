/**
 * Time (ms) until the URL of the downloaded content is released. The download starts after the click, asynchronously:
 * releasing the URL right after makes some browsers (e.g. Firefox and Safari) cancel the download or save an empty file.
 */
const REVOKE_DELAY = 10_000;

/**
 * Makes the browser download a content generated in the page itself (e.g. an exported file), as a download link would.
 * @param blob content of the file
 * @param fileName name of the saved file
 */
export function downloadBlob(blob: Blob, fileName: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), REVOKE_DELAY);
}
