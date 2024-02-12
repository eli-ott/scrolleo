/**
 * Convert the scroll step from vw/vh to px
 *
 * @param {number} value The value to convert
 * @param {'horizontal' | 'vertical'} direction The direction of the current scroll
 * @returns {number} The converted value
 */
export default function convertToPx(value: number, direction: 'horizontal' | 'vertical'): number;
