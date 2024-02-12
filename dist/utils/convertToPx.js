"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Convert the scroll step from vw/vh to px
 *
 * @param {number} value The value to convert
 * @param {'horizontal' | 'vertical'} direction The direction of the current scroll
 * @returns {number} The converted value
 */
function convertToPx(value, direction) {
    if (direction === 'horizontal')
        return Math.round((value * window.outerWidth) / 100);
    return Math.round((value * window.outerHeight) / 100);
}
exports.default = convertToPx;
