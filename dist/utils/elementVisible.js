"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.elementVisible = elementVisible;
/**
 * If the element is visible on the screen
 *
 * @param {Element} element The element to check
 * @returns {boolean} If the element is visible or not
 */
function elementVisible(element) {
    let elementInfos = element.getBoundingClientRect();
    let viewHeight = Math.max(window.innerHeight, document.documentElement.clientHeight);
    return !(elementInfos.bottom < 0 || elementInfos.top - viewHeight >= 0);
}
