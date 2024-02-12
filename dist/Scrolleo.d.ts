import type { ScrolleoConstructor } from './types/ScrolleoConstructor';
/**
 * The Scrolleo class
 */
export declare class Scrolleo {
    /** The element to apply the scroll */
    element: HTMLElement;
    /** The easing of the scroll (default 'cubic-bezier(0.19,0.57,0.51,0.99)') */
    ease: string;
    /** Scroll direction (default 'vertical') */
    direction: 'horizontal' | 'vertical';
    /** The smoothness of the scroll (default '0.25') */
    smoothness: number;
    /** If we can also drag to scroll (default 'false') */
    draggable: boolean;
    /** If we throttle the scroll (default 'true') */
    throttle: boolean;
    /** The delay to wait between each scroll in milliseconds (default '150') */
    throttleDelay: number;
    /** The percentage of the windows to scroll each time (default '20') */
    scrollPercentage: number;
    /** The minimum scroll the user can do in pixels */
    private minScroll;
    /** The maximum scroll the user can do in pixels */
    private maxScroll;
    /** If the user can scroll (to throttle the scroll mostly) */
    private canScroll;
    /** The wheel event abort signal  */
    private wheelSignal;
    /** The drag abort signal */
    private dragSignal;
    /**
     * Constructor
     *
     * @param {ScrolleoConstructor} ScrolleoConstructor The constructor for the scroll
     */
    constructor({ element, ease, direction, smoothness, draggable, throttle, throttleDelay, scrollPercentage }: ScrolleoConstructor);
    /**
     * Initializing Scrolleo
     */
    init(): void;
    /**
     * Reset the whole scroll and stops the event listeners
     */
    destroy(): void;
    /**
     * Remove all the events listeners
     */
    private removeListeners;
    /**
     * Calculate the max possible scroll based on the scroll direction
     *
     * @returns {number} The max possible scroll in pixels
     */
    private calculateMaxScroll;
    /**
     * If the element is visible on the screen
     *
     * @param {Element} element The element to check
     * @returns {boolean} If the element is visible or not
     */
    private elementVisible;
    /**
     * Create the elements' scroll speed
     */
    private setElementsSpeed;
    /**
     * Setting all the listeners for the scroll and drag
     */
    private setListener;
    /**
     * Throttle the scroll
     */
    private throttleScroll;
    /**
     * Calculate the scroll for each element
     *
     * @param {number} deltaY The direction of the scroll
     */
    private calculateScroll;
    /**
     * Apply the calculated scroll to the elements
     *
     * @param {HTMLElement} element The element to apply the scroll to
     * @param {number} scroll The scroll amount
     */
    private applyScroll;
}
