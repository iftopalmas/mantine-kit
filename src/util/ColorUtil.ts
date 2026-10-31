/**
 * Changes the shade of a hexadecimal color in the `#RRGGBB` format.
 * @param hexColor hexadecimal color
 * @param scale value added to (or, if negative, subtracted from) the color
 * @return the hexadecimal color in a different shade, according to the scale
 */
export function changeColorShade(hexColor: string, scale: number): string {
    if (!/^#[0-9A-Fa-f]{6}$/.test(hexColor)) {
        throw new Error('Invalid hexadecimal color code');
    }

    // Hexadecimal code of the color, without the leading #
    const hexDigits = hexColor.substring(1);
    const gradedBgColorInt = parseInt(hexDigits, 16) + scale;
    return '#' + gradedBgColorInt.toString(16);
}
