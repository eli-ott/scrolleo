/**
 * Scrolleo's constructor type
 */
export interface ScrolleoConstructor {
    /** The element that would have the scroll */
	element: HTMLElement;
    /** The easing of the scroll */
	ease: string;
    /** Scroll direction (horizontal or vertical) */
	direction: 'horizontal' | 'vertical';
    /** The smoothness of the scroll */
	smoothness: number;
    /** If we can also drag to scroll */
	draggable: boolean;
    /** If we throttle the scroll (mainly for Apple magic mouse) */
	throttle: boolean;
    /** The delay to wait between each scroll */
	throttleDelay: number;
    /** The percentage of the windows to scroll each time */
	scrollPercentage: number;
}
