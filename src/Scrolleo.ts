import type { ScrolleoConstructor, ScrollToOptions } from './types';
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
	private scrolledElements: HTMLElement[] = [];
	/** The minimum scroll the user can do in pixels */
	private minScroll: number = 0;
	/** The maximum scroll the user can do in pixels */
	private maxScroll: number = 0;
	/** If the user can scroll (to throttle the scroll mostly) */
	private canScroll: boolean = false;
	/** If the user can drag to scroll */
	private canDrag: boolean = false;
	/** The initial position of the user drag */
	private dragInitialPosition: number = 0;
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
		draggable = false,
		dragSpeed = 1,
		throttle = true,
		throttleDelay = 100,
		scrollPercentage = 20,
		offsetBottom = 0
	}: ScrolleoConstructor) {
		this.element = element;
		this.ease = ease;
		this.direction = direction;
		this.smoothness = smoothness;
		this.draggable = draggable;
		this.dragSpeed = dragSpeed;
		this.throttle = throttle;
		this.throttleDelay = throttleDelay;
		this.scrollPercentage = scrollPercentage;
		this.offsetBottom = offsetBottom;
	}

	/**
	 * Initializing Scrolleo
	 */
	public init(): void {
		//we scroll to the top of the window
		window.scroll(0, 0);

		this.maxScroll = this.calculateMaxScroll();
		//set the elements that needs to be scrolled
		this.setScrolledElements();

		//setting the elements transitions
		this.scrolledElements.forEach(element => {
			this.setTransition(element);

			//setting the current scroll to 0 for each elements
			element.dataset.currentScroll = '0';
			if (!element.dataset.scrollSpeed) element.dataset.scrollSpeed = '1';

			//initializing the element's speed
			this.setElementsSpeed(element);
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
	 * Set the elements that needs be scrolled
	 */
	private setScrolledElements(): void {
		this.element.querySelectorAll<HTMLElement>(':scope > *').forEach(element => {
			this.scrolledElements.push(element);
		});
		this.element.querySelectorAll<HTMLElement>(':scope > * [data-scroll-speed]').forEach(element => {
			this.scrolledElements.push(element);
		});
	}

	/**
	 * Calculate the max possible scroll based on the scroll direction
	 *
	 * @returns {number} The max possible scroll in pixels
	 */
	private calculateMaxScroll(): number {
		if (this.direction === 'vertical') {
			return (
				this.element.getBoundingClientRect().height +
				this.element.getBoundingClientRect().top -
				window.innerHeight -
				convertToPx(this.offsetBottom, this.direction)
			);
		} else if (this.direction === 'horizontal') {
			return (
				this.element.getBoundingClientRect().width +
				this.element.getBoundingClientRect().left -
				window.innerWidth -
				convertToPx(this.offsetBottom, this.direction)
			);
		} else {
			console.error("Scroll direction is not valid, only possible values are 'vertical' and 'horizontal'");
			throw new Error("Scroll direction is not valid, only possible values are 'vertical' and 'horizontal'");
		}
	}

	/**
	 * Create the scroll animation for the element
	 *
	 * @param {HTMLElement} element The element to apply the transition to
	 */
	private setTransition(element: HTMLElement): void {
		let elementTransition = element.computedStyleMap().get('transition');

		element.style.transition = `${elementTransition}, transform ${this.smoothness}s ${this.ease}`;
	}

	/**
	 * Set the elements' scroll speed
	 *
	 * @param {HTMLElement} element The element that needs its speed set
	 */
	private setElementsSpeed(element: HTMLElement): void {
		element.dataset.scrollStep = convertToPx(this.scrollPercentage * parseFloat(element.dataset.scrollSpeed!), this.direction).toString();
	}

	/**
	 * Setting all the listeners for the scroll and drag
	 */
	private setListener(): void {
		//avoid the default scroll on other elements
		document.querySelector<HTMLElement>('body')!.style.overflow = 'hidden';

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
			this.element.addEventListener(
				'mousedown',
				e => {
					//preventing the user to scroll
					this.canScroll = false;
					//allowing the user to drag
					this.canDrag = true;

					//setting the initial position of the user mouse
					if (this.direction === 'horizontal') {
						this.dragInitialPosition = e.clientX;
					} else {
						this.dragInitialPosition = e.clientY;
					}
				},
				{
					signal: this.dragSignal.signal
				}
			);

			this.element.addEventListener(
				'mousemove',
				e => {
					if (this.canDrag) {
						e.preventDefault();

						if (this.direction === 'horizontal') {
							this.calculateDrag(e.clientX);
						} else if (this.direction === 'vertical') {
							this.calculateDrag(e.clientY);
						} else {
							console.error("Scroll direction is not valid, only possible values are 'vertical' and 'horizontal'");
							throw new Error("Scroll direction is not valid, only possible values are 'vertical' and 'horizontal'");
						}
					}
				},
				{
					signal: this.dragSignal.signal
				}
			);

			this.element.addEventListener(
				'mouseup',
				() => {
					//allowing the user to sroll again
					this.canScroll = true;
					//preventing the user to drag
					this.canDrag = false;
					//reseting the initial drag position
					this.dragInitialPosition = 0;
				},
				{
					signal: this.dragSignal.signal
				}
			);

			this.element.addEventListener(
				'mouseleave',
				() => {
					//allowing the user to sroll again
					this.canScroll = true;
					//preventing the user to drag
					this.canDrag = false;
					//reseting the initial drag position
					this.dragInitialPosition = 0;
				},
				{
					signal: this.dragSignal.signal
				}
			);
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
		//calculating the max scroll if it changes
		this.maxScroll = this.calculateMaxScroll();

		this.scrolledElements.forEach(element => {
			let currentScroll: number;

			//calculating the scroll depending on the direction the user scroll (up or down)
			if (deltaY < 0) {
				currentScroll = clamp(
					parseFloat(element.dataset.currentScroll!) - parseFloat(element.dataset.scrollStep!),
					this.minScroll,
					this.maxScroll * parseFloat(element.dataset.scrollSpeed!)
				);
			} else {
				currentScroll = clamp(
					parseFloat(element.dataset.currentScroll!) + parseFloat(element.dataset.scrollStep!),
					this.minScroll,
					this.maxScroll * parseFloat(element.dataset.scrollSpeed!)
				);
			}

			this.applyScroll(element, currentScroll);
		});
	}

	/**
	 * Calculate the drag distance of the user
	 *
	 * @param {number} mousePosition The current mouse position
	 */
	private calculateDrag(mousePosition: number): void {
		let currentScroll: number;

		this.scrolledElements.forEach(element => {
			currentScroll = clamp(
				parseFloat(element.dataset.currentScroll!) +
					(this.dragInitialPosition - mousePosition) * parseFloat(element.dataset.scrollSpeed!) * this.dragSpeed,
				this.minScroll,
				this.maxScroll * parseFloat(element.dataset.scrollSpeed!)
			);

			this.applyScroll(element, currentScroll);
		});

		this.dragInitialPosition = mousePosition;
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
			element.style.transform = `translateY(${-scroll}px) translateX(${containerTranslateX}px)`;
		} else if (this.direction === 'horizontal') {
			element.style.transform = `translateY(${containerTranslateY}px) translateX(${-scroll}px)`;
		}
		//settting the currentScroll for the element
		element.dataset.currentScroll = scroll.toString();
	}

	/**
	 * Scroll a percentage of the window
	 *
	 * @param {number} percentage The percentage of the window to scroll
	 */
	public scroll(percentage: number): void {
		let currentScroll: number;
		this.scrolledElements.forEach(element => {
			currentScroll = clamp(
				convertToPx(percentage, this.direction) * parseFloat(element.dataset.scrollSpeed!),
				this.minScroll,
				this.maxScroll * parseFloat(element.dataset.scrollSpeed!)
			);

			this.applyScroll(element, currentScroll);
		});
	}

	/**
	 * Scroll to a specified element
	 *
	 * @param {HTMLElement} element The element to scroll to
	 * @param {ScrollTo} options The options of the scrollTo
	 */
	public scrollTo(
		element: HTMLElement,
		options: ScrollToOptions = {
			align: 'start',
			margin: 0
		}
	): void {
		if (!element) console.error('scrollTo element is undefined');

		const rect: DOMRect = element.getBoundingClientRect();

		let scrollDistance: number;
		if (options.align === 'start') {
			scrollDistance = rect.top / parseFloat(element.dataset.scrollSpeed!) - convertToPx(options.margin!, this.direction);
		} else if (options.align === 'end') {
			scrollDistance =
				rect.bottom / parseFloat(element.dataset.scrollSpeed!) - window.innerHeight + convertToPx(options.margin!, this.direction);
		} else {
			console.error("Align option is invalid, only possible values are 'start' and 'end'");
		}

		let currentScroll: number;
		this.scrolledElements.forEach(element => {
			currentScroll = clamp(
				scrollDistance * parseFloat(element.dataset.scrollSpeed!),
				this.minScroll,
				this.maxScroll * parseFloat(element.dataset.scrollSpeed!)
			);

			this.applyScroll(element, currentScroll);
		});
	}
}
