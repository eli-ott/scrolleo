/**
 * Convert the scroll step from vw/vh to px
 *
 * @param {number} value The value to convert
 * @returns {number} The converted value
 */
export default function convertToPx(value: number, direction: 'horizontal' | 'vertical'): number {
	if (direction === 'horizontal') {
		return Math.round((value * window.outerWidth) / 100);
	}
	return Math.round((value * window.outerHeight) / 100);
}
