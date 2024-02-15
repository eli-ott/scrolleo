/**
 * Clamp a value between a min and a max
 * Inverting min and max because scroll values are negative
 * 
 * @param {number} value The vlaue to clamp
 * @param {number} min The minimum
 * @param {number} max The maximum
 * @returns {number} The clamped value
 */
export default function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}