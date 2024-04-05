/**
 * Scrolleo's constructor type
 */
export interface ScrolleoConstructor {
	/** The name of the container that would have the scroll (using querySelector) */
	container: string;
	/** The easing of the scroll (default 'cubic-bezier(0.19,0.57,0.51,0.99)') */
	ease?: string;
	/** Scroll direction (default 'vertical') */
	direction?: 'horizontal' | 'vertical';
	/** The smoothness of the scroll (default '0.25') */
	smoothness?: number;
	/** If we can also drag to scroll (default 'false') */
	draggable?: boolean;
	/** The drag speed (default '1') */
	dragSpeed?: number;
	/** If we throttle the scroll (default 'true') */
	throttle?: boolean;
	/** The delay to wait between each scroll in milliseconds (default '100') */
	throttleDelay?: number;
	/** The percentage of the windows to scroll each time (default '20') */
	scrollPercentage?: number;
	/** The percentage of the window to remove at the end of the scroll (default: '0')  */
	offsetBottom?: number;
	/** The name of the elements to scroll (using querySelectorAll), if null will be the direct children of the container (default: 'null') */
	elementsToScroll?: string | null;
	/** If the scroll listener is set globally, so to the whole window (default: false) */
	globalScroll?: boolean;
}
