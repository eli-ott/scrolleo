import type { ScrolleoConstructor } from './types/ScrolleoConstructor';
import { clamp, convertToPx } from './utils';

/**
 * The scroll class
 */
export class Scrolleo {
	/** The element to apply the scroll */
	element: HTMLElement;
	/** The easing of the scroll */
	ease: string;
	/** The direction of the scroll */
	direction: 'horizontal' | 'vertical';
	/** Linear interpolation intensity of the scroll (between 0 and 1) */
	smoothness: number;
	/** If the scroll can be dragged too */
	draggable: boolean;
	/** If we throttle the scroll */
	throttle: boolean;
	/** The delay at which the scroll is throttled */
	throttleDelay: number;
	/** The size of the scroll (0-100% of screen size) */
	scrollPercentage: number;
	/** The current scroll */
	private currentScroll: number = 0;
	/** The minimum scroll the user can do in pixels */
	private minScroll: number = 0;
	/** The maximum scroll the user can do in pixels */
	private maxScroll: number;
	/** If the user can scroll (to throttle the scroll mostly) */
	private canScroll: boolean = false;
	/** The wheel event abort signal  */
	private wheelSignal: AbortController = new AbortController();
	/** The drag abort signal */
	private dragSignal: AbortController = new AbortController();

	/**
	 * Constructor
	 *
	 * @param {ScrolleoConstructor} ScrolleoConstructor The constructor for the scroll
	 */
	constructor({
		element,
		ease = 'cubic-bezier(.19,.57,.51,.99)',
		direction = 'vertical',
		smoothness = 0.25,
		draggable = true,
		throttle = true,
		throttleDelay = 150,
		scrollPercentage = 20
	}: ScrolleoConstructor) {
		this.element = element;
		this.ease = ease;
		this.direction = direction;
		this.smoothness = smoothness;
		this.draggable = draggable;
		this.throttle = throttle;
		this.throttleDelay = throttleDelay;
		this.scrollPercentage = scrollPercentage;
	}

	/**
	 * Initializing Scrolleo
	 */
	public init(): void {
		this.maxScroll = this.calculateMaxScroll();

		const observer = new MutationObserver(this.setElementsSpeed);
		observer.observe(this.element, { childList: true, subtree: true, attributes: true, attributeFilter: ['style'] });

		this.setElementsSpeed();

		//setting the elements transitions
		this.element.querySelectorAll<HTMLElement>(':scope > *').forEach(child => {
			let childTransition = child.computedStyleMap().get('transition');

			child.style.transition = `${childTransition}, transform ${this.smoothness}s ${this.ease}`;

			//setting the current scroll to 0 for each elements
			child.dataset.currentScroll = '0';
		});

		this.setListener();

		this.canScroll = true;
	}

	/**
	 * Reset the whole scroll and stops the event listeners
	 */
	public reset(): void {
		this.currentScroll = 0;
		this.canScroll = false;
		this.maxScroll = 0;
		this.removeListeners();
	}

	/**
	 * Remove all the events listeners
	 */
	private removeListeners(): void {
		this.wheelSignal.abort();
		this.dragSignal.abort();
	}

	/**
	 * Calculate the max possible scroll based on the scroll direction
	 *
	 * @returns {number} The max possible scroll in pixels
	 */
	private calculateMaxScroll(): number {
		if (this.direction === 'vertical') {
			return this.element.getBoundingClientRect().height;
		} else {
			return this.element.getBoundingClientRect().width;
		}
	}

	/**
	 * If the element is visible on the screen
	 *
	 * @param {Element} element The element to check
	 * @returns {boolean} If the element is visible or not
	 */
	private elementVisible(element: Element): boolean {
		let elementInfos = element.getBoundingClientRect();
		let viewHeight = Math.max(window.innerHeight, document.documentElement.clientHeight);
		return !(elementInfos.bottom < 0 || elementInfos.top - viewHeight >= 0);
	}

	/**
	 * Create the elements' scroll speed
	 */
	private setElementsSpeed(): void {
		this.element.querySelectorAll<HTMLElement>(':scope > *').forEach(child => {
			if (child.dataset.scrollSpeed && this.elementVisible(child)) {
				child.dataset.scrollStep = convertToPx(this.scrollPercentage * parseFloat(child.dataset.scrollSpeed), this.direction).toString();
			} else {
				child.dataset.scrollStep = convertToPx(this.scrollPercentage, this.direction).toString();
			}
		});
	}

	/**
	 * Setting all the listeners for the scroll and drag
	 */
	private setListener(): void {
		this.element.addEventListener(
			'wheel',
			e => {
				if (this.canScroll) {
					if (this.throttle) this.throttleScroll();

					this.scroll(e.deltaY);
				}
			},
			{
				signal: this.wheelSignal.signal
			}
		);

		if (this.draggable) {
			this.element.addEventListener('mousedown', e => {}, {
				signal: this.dragSignal.signal
			});

			this.element.addEventListener('mousemove', e => {}, {
				signal: this.dragSignal.signal
			});

			this.element.addEventListener('mouseup', e => {}, {
				signal: this.dragSignal.signal
			});

			this.element.addEventListener('mouseleave', e => {}, {
				signal: this.dragSignal.signal
			});
		}
	}

	/**
	 * Throttle the scroll
	 */
	private throttleScroll() {
		this.canScroll = false;

		setTimeout(() => {
			this.canScroll = true;
		}, this.throttleDelay);
	}

	/**
	 * Scroll the elements
	 *
	 * @param {number} deltaY The direction of the scroll
	 */
	private scroll(deltaY: number) {
		const containerStyle = window.getComputedStyle(this.element);
		const containerTransformStyle = new WebKitCSSMatrix(containerStyle.transform);
		const containerTranslateX = containerTransformStyle.e;
		const containerTranslateY = containerTransformStyle.f;

		//store each elemeent currentscroll
		this.element.querySelectorAll<HTMLElement>(':scope > *').forEach(child => {
			console.log(clamp(parseFloat(child.dataset.currentScroll!) + parseFloat(child.dataset.scrollStep!), this.minScroll, this.maxScroll));
		});
	}
}
