import type { ScrolleoConstructor, ScrollToOptions } from './types';
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
    /** The drag speed (default '1') */
    dragSpeed: number;
    /** If we throttle the scroll (default 'true') */
    throttle: boolean;
    /** The delay to wait between each scroll in milliseconds (default '150') */
    throttleDelay: number;
    /** The percentage of the windows to scroll each time (default '20') */
    scrollPercentage: number;
    /** The percentage of the window to remove at the end of the scroll (default: '0') */
    offsetBottom: number;
    /** The elements that will be scrolled */
    private scrolledElements;
    /** The minimum scroll the user can do in pixels */
    private minScroll;
    /** The maximum scroll the user can do in pixels */
    private maxScroll;
    /** If the user can scroll (to throttle the scroll mostly) */
    private canScroll;
    /** If the user can drag to scroll */
    private canDrag;
    /** The initial position of the user drag */
    private dragInitialPosition;
    /** The wheel event abort signal  */
    private wheelSignal;
    /** The drag abort signal */
    private dragSignal;
    /**
     * Constructor
     *
     * @param {ScrolleoConstructor} ScrolleoConstructor The constructor for the scroll
     */
    constructor({ element, ease, direction, smoothness, draggable, dragSpeed, throttle, throttleDelay, scrollPercentage, offsetBottom }: ScrolleoConstructor);
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
     * Set the elements that needs be scrolled
     */
    private setScrolledElements;
    /**
     * Calculate the max possible scroll based on the scroll direction
     *
     * @returns {number} The max possible scroll in pixels
     */
    private calculateMaxScroll;
    /**
     * Create the scroll animation for the element
     *
     * @param {HTMLElement} element The element to apply the transition to
     */
    private setTransition;
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
     * Calculate the drag distance of the user
     *
     * @param {number} mousePosition The current mouse position
     */
    private calculateDrag;
    /**
     * Apply the calculated scroll to the elements
     *
     * @param {HTMLElement} element The element to apply the scroll to
     * @param {number} scroll The scroll amount
     */
    private applyScroll;
    /**
     * Scroll a percentage of the window
     *
     * @param {number} percentage The percentage of the window to scroll
     */
    scroll(percentage: number): void;
    /**
     * Scroll to a specified element
     *
     * @param {HTMLElement} element The element to scroll to
     * @param {ScrollTo} options The options of the scrollTo
     */
    scrollTo(element: HTMLElement, options?: ScrollToOptions): void;
}
