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
	/** The minimum scroll the user can do in pixels */
	private minScroll: number = 0;
	/** The maximum scroll the user can do in pixels */
	private maxScroll: number;
	/** If the user can scroll (to throttle the scroll mostly) */
	private canScroll: boolean = false;
	/** The wheel event abort signal  */
	private wheelSignal: AbortSignal = new AbortSignal();
	/** The drag abort signal */
	private dragSignal: AbortSignal = new AbortSignal();

	/**
	 * Constructor
	 *
	 * @param {HTMLElement} element The container of the scroll
	 * @param {string} ease The easing method
	 * @param {'horizontal' | 'vertical'} direction The direction of scroll
	 * @param {number} smoothness The smoothness of the scroll
	 * @param {boolean} draggable If the container can also be dragged
	 * @param {boolean} throttle If we throttle the scroll (good for apple magic mouse)
	 * @param {number} throttleDelay The amount of time in milliseconds the user can't scroll for
	 * @param {number} scrollPercentage The size of the scroll (0-100% of screen size)
	 */
	constructor(
		element: HTMLElement,
		ease: string = 'cubic-bezier(.19,.57,.51,.99)',
		direction: 'horizontal' | 'vertical' = 'horizontal',
		smoothness: number = 0.25,
		draggable: boolean = true,
		throttle: boolean = true,
		throttleDelay: number = 150,
		scrollPercentage: number = 20
	) {
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
		this.maxScroll = this.element.getBoundingClientRect().width;

		const observer = new MutationObserver(this.observerCallback);
		observer.observe(this.element, { childList: true, subtree: true });

		this.setElementsSpeed();
		this.setListener();

		this.canScroll = true;
	}

	/**
	 * The media observer callback
	 * 
	 * @param {MutationRecord[]} mutationList The mutation list
	 * @param {MutationObserver} observer The mutation Observer
	 */
	private observerCallback(mutationList: MutationRecord[], observer: MutationObserver): void {
		for(const mutation of mutationList) {
            console.log(mutation);
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
			let childTransition = child.computedStyleMap().get('transition');

			if (this.elementVisible(child)) {
				child.style.transition = `${childTransition}, transform ${this.smoothness * parseFloat(child.dataset.scrollSpeed!)}s 
				${this.ease}`;
			} else {
				child.style.transition = `${childTransition}, transform ${this.smoothness}s ${this.ease}`;
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
				}
			},
			{
				signal: this.wheelSignal
			}
		);

		if (this.draggable) {
			this.element.addEventListener('mousedown', e => {}, {
				signal: this.dragSignal
			});

			this.element.addEventListener('mousemove', e => {}, {
				signal: this.dragSignal
			});

			this.element.addEventListener('mouseup', e => {}, {
				signal: this.dragSignal
			});

			this.element.addEventListener('mouseleave', e => {}, {
				signal: this.dragSignal
			});
		}
	}

	/**
	 * Throttle the scroll
	 */
	throttleScroll() {
		this.canScroll = false;

		setTimeout(() => {
			this.canScroll = true;
		}, this.throttleDelay);
	}
}
