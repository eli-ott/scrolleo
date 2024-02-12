import type { ScrolleoConstructor } from './types/ScrolleoConstructor';
import { clamp, convertToPx } from './utils';

/**
 * The Scrolleo class
 */
export class Scrolleo {
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
	private minScroll: number = 0;
	/** The maximum scroll the user can do in pixels */
	private maxScroll: number = 0;
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
		ease = 'cubic-bezier(0.19,0.57,0.51,0.99)',
		direction = 'vertical',
		smoothness = 0.25,
		draggable = true,
		throttle = true,
		throttleDelay = 100,
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

		//creating an observer to change element's speed if it is visible
		const observer = new MutationObserver(this.setElementsSpeed);
		observer.observe(this.element, { childList: true, subtree: true, attributes: true, attributeFilter: ['style'] });

		//initializing the element's speed
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
	public destroy(): void {
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
			//adding the window height/width
			return -this.element.getBoundingClientRect().height + window.outerHeight;
		} else {
			return -this.element.getBoundingClientRect().width + window.outerWidth;
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
				e.preventDefault();

				if (this.canScroll) {
					if (this.throttle) this.throttleScroll();

					this.calculateScroll(e.deltaY);
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
	private throttleScroll(): void {
		this.canScroll = false;

		setTimeout(() => {
			this.canScroll = true;
		}, this.throttleDelay);
	}

	/**
	 * Calculate the scroll for each element
	 *
	 * @param {number} deltaY The direction of the scroll
	 */
	private calculateScroll(deltaY: number): void {
		if (document.querySelectorAll<HTMLElement>(':scope > *')) {
			this.element.querySelectorAll<HTMLElement>(':scope > *').forEach(child => {
				let currentScroll: number;

				//calculating the scroll depending on the direction the user scroll (up or down)
				if (deltaY > 0) {
					currentScroll = clamp(
						parseFloat(child.dataset.currentScroll!) - parseFloat(child.dataset.scrollStep!),
						this.minScroll,
						this.maxScroll
					);
				} else {
					currentScroll = clamp(
						parseFloat(child.dataset.currentScroll!) + parseFloat(child.dataset.scrollStep!),
						this.minScroll,
						this.maxScroll
					);
				}

				this.applyScroll(child, currentScroll);
			});
		}
	}

	/**
	 * Apply the calculated scroll to the elements
	 *
	 * @param {HTMLElement} element The element to apply the scroll to
	 * @param {number} scroll The scroll amount
	 */
	private applyScroll(element: HTMLElement, scroll: number): void {
		const containerStyle = window.getComputedStyle(this.element);
		const containerTransformStyle = new WebKitCSSMatrix(containerStyle.transform);
		const containerTranslateX = containerTransformStyle.e;
		const containerTranslateY = containerTransformStyle.f;

		//applying the transform based on the scorll direction
		if (this.direction === 'vertical') {
			element.style.transform = `translateY(${scroll}px) translateX(${containerTranslateX}px)`;
		} else if (this.direction === 'horizontal') {
			element.style.transform = `translateY(${containerTranslateY}px) translateX(${scroll}px)`;
		}
		//settting the currentScroll for the element
		element.dataset.currentScroll = scroll.toString();
	}
}
