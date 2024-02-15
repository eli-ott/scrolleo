"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Clamp a value between a min and a max
 * Inverting min and max because scroll values are negative
 *
 * @param {number} value The vlaue to clamp
 * @param {number} min The minimum
 * @param {number} max The maximum
 * @returns {number} The clamped value
 */
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}
exports.default = clamp;
