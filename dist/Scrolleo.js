"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Scrolleo = void 0;
const utils_1 = require("./utils");
/**
 * The Scrolleo class
 */
class Scrolleo {
    /**
     * Constructor
     *
     * @param {ScrolleoConstructor} ScrolleoConstructor The constructor for the scroll
     */
    constructor({ container, ease = 'cubic-bezier(0.19,0.57,0.51,0.99)', direction = 'vertical', smoothness = 0.25, draggable = false, dragSpeed = 1, throttle = true, throttleDelay = 100, scrollPercentage = 20, offsetBottom = 0, elementsToScroll = null, globalScroll = false }) {
        /** The elements that will be scrolled */
        this.scrolledElements = [];
        /** The minimum scroll the user can do in pixels */
        this.minScroll = 0;
        /** The maximum scroll the user can do in pixels */
        this.maxScroll = 0;
        /** If the user can scroll (to throttle the scroll mostly) */
        this.canScroll = false;
        /** If the user can drag to scroll */
        this.canDrag = false;
        /** The initial position of the user drag */
        this.dragInitialPosition = 0;
        /** If scrolleo was initialized */
        this.initialized = false;
        /** The wheel event abort signal  */
        this.wheelSignal = new AbortController();
        /** The drag abort signal */
        this.dragSignal = new AbortController();
        //setting the selectors for the scrolledElements and the container to use them later
        this.containerSelector = container;
        this.elementsToScrollSelector = elementsToScroll;
        //setting the container and elementsToScroll based on the selectors
        this.container = document.querySelector(this.containerSelector);
        this.elementsToScroll = this.elementsToScrollSelector ? document.querySelectorAll(this.elementsToScrollSelector) : null;
        this.ease = ease;
        this.direction = direction;
        this.smoothness = smoothness;
        this.draggable = draggable;
        this.dragSpeed = dragSpeed;
        this.throttle = throttle;
        this.throttleDelay = throttleDelay;
        this.scrollPercentage = scrollPercentage;
        this.offsetBottom = offsetBottom;
        this.globalScroll = globalScroll;
    }
    /**
     * Initializing Scrolleo
     */
    init() {
        //we scroll to the top of the window
        window.scroll(0, 0);
        this.maxScroll = this.calculateMaxScroll();
        //setting the containe and scrolledElements at every initialization
        //so that if the elements were not in the DOM when the constructor exectued we can still catch them
        this.container = document.querySelector(this.containerSelector);
        this.elementsToScroll = this.elementsToScrollSelector ? document.querySelectorAll(this.elementsToScrollSelector) : null;
        //set the elements that needs to be scrolled
        this.setScrolledElements();
        //setting the elements transitions
        this.scrolledElements.forEach(element => {
            this.setTransition(element);
            //setting the current scroll to 0 for each elements
            element.dataset.currentScroll = '0';
            element.dataset.scrollStep = (0, utils_1.convertToPx)(this.scrollPercentage, this.direction).toString();
        });
        if (!this.initialized) {
            //allow to initialize multiple time without setting the listeners more than once
            this.setListener();
            this.canScroll = true;
            this.initialized = true;
        }
    }
    /**
     * If the scrolleo was initialized
     *
     * @returns {boolean} If the scrolleo was initialized
     */
    isInit() {
        return this.initialized;
    }
    /**
     * Reset the whole scroll and stops the event listeners
     */
    destroy() {
        document.querySelector('body').style.overflow = 'scroll';
        this.canScroll = false;
        this.maxScroll = 0;
        this.removeListeners();
        this.initialized = false;
    }
    /**
     * Remove all the events listeners
     */
    removeListeners() {
        this.wheelSignal.abort();
        this.dragSignal.abort();
    }
    /**
     * Set the elements that needs be scrolled
     */
    setScrolledElements() {
        //Resetting scrolledElements before setting them
        this.scrolledElements = [];
        if (this.elementsToScroll) {
            this.scrolledElements = this.elementsToScroll;
        }
        else {
            this.container.querySelectorAll(':scope > *').forEach(element => {
                this.scrolledElements.push(element);
            });
        }
    }
    /**
     * Returns the scroll container
     *
     * @returns {HTMLElement} The container
     */
    getScrollContainer() {
        return this.container;
    }
    /**
     * Return the elements that needs to be scrolled
     *
     * @returns {HTMLElement[]} The scrolled elements
     */
    getScrolledElements() {
        return this.scrolledElements;
    }
    /**
     * Calculate the max possible scroll based on the scroll direction
     *
     * @returns {number} The max possible scroll in pixels
     */
    calculateMaxScroll() {
        if (this.direction === 'vertical') {
            return this.container.getBoundingClientRect().height + this.container.getBoundingClientRect().top - window.innerHeight - (0, utils_1.convertToPx)(this.offsetBottom, this.direction);
        }
        else if (this.direction === 'horizontal') {
            return this.container.getBoundingClientRect().width + this.container.getBoundingClientRect().left - window.innerWidth - (0, utils_1.convertToPx)(this.offsetBottom, this.direction);
        }
        else {
            console.error("Scroll direction is not valid, only possible values are 'vertical' and 'horizontal'");
            throw new Error("Scroll direction is not valid, only possible values are 'vertical' and 'horizontal'");
        }
    }
    /**
     * Return the calculated max scroll
     *
     * @returns {number} The max scroll
     */
    getMaxScroll() {
        return this.maxScroll;
    }
    /**
     * Create the scroll animation for the element
     *
     * @param {HTMLElement} element The element to apply the transition to
     */
    setTransition(element) {
        element.style.transition = `transform ${this.smoothness}s ${this.ease}`;
    }
    /**
     * Setting all the listeners for the scroll and drag
     */
    setListener() {
        //avoid the default scroll on other elements
        document.querySelector('body').style.overflow = 'hidden';
        const scrollTrigger = global ? window : this.container;
        scrollTrigger.addEventListener('wheel', e => {
            e.preventDefault();
            if (this.canScroll) {
                if (this.throttle)
                    this.throttleScroll();
                this.calculateScroll(e.deltaY);
            }
        }, {
            signal: this.wheelSignal.signal
        });
        if (this.draggable) {
            scrollTrigger.addEventListener('mousedown', e => {
                //preventing the user to scroll
                this.canScroll = false;
                //allowing the user to drag
                this.canDrag = true;
                //setting the initial position of the user mouse
                if (this.direction === 'horizontal') {
                    this.dragInitialPosition = e.clientX;
                }
                else {
                    this.dragInitialPosition = e.clientY;
                }
            }, {
                signal: this.dragSignal.signal
            });
            scrollTrigger.addEventListener('mousemove', e => {
                if (this.canDrag) {
                    e.preventDefault();
                    if (this.direction === 'horizontal') {
                        this.calculateDrag(e.clientX);
                    }
                    else if (this.direction === 'vertical') {
                        this.calculateDrag(e.clientY);
                    }
                    else {
                        console.error("Scroll direction is not valid, only possible values are 'vertical' and 'horizontal'");
                        throw new Error("Scroll direction is not valid, only possible values are 'vertical' and 'horizontal'");
                    }
                }
            }, {
                signal: this.dragSignal.signal
            });
            scrollTrigger.addEventListener('mouseup', () => {
                //allowing the user to sroll again
                this.canScroll = true;
                //preventing the user to drag
                this.canDrag = false;
                //reseting the initial drag position
                this.dragInitialPosition = 0;
            }, {
                signal: this.dragSignal.signal
            });
            scrollTrigger.addEventListener('mouseleave', () => {
                //allowing the user to sroll again
                this.canScroll = true;
                //preventing the user to drag
                this.canDrag = false;
                //reseting the initial drag position
                this.dragInitialPosition = 0;
            }, {
                signal: this.dragSignal.signal
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
    /**
     * Calculate the scroll for each element
     *
     * @param {number} deltaY The direction of the scroll
     */
    calculateScroll(deltaY) {
        //calculating the max scroll if it changes
        this.maxScroll = this.calculateMaxScroll();
        this.scrolledElements.forEach(element => {
            let currentScroll;
            //calculating the scroll depending on the direction the user scroll (up or down)
            if (deltaY < 0) {
                currentScroll = (0, utils_1.clamp)(parseFloat(element.dataset.currentScroll) - parseFloat(element.dataset.scrollStep), this.minScroll, this.maxScroll);
            }
            else {
                currentScroll = (0, utils_1.clamp)(parseFloat(element.dataset.currentScroll) + parseFloat(element.dataset.scrollStep), this.minScroll, this.maxScroll);
            }
            this.applyScroll(element, currentScroll);
        });
    }
    /**
     * Calculate the drag distance of the user
     *
     * @param {number} mousePosition The current mouse position
     */
    calculateDrag(mousePosition) {
        let currentScroll;
        this.scrolledElements.forEach(element => {
            currentScroll = (0, utils_1.clamp)(parseFloat(element.dataset.currentScroll) + (this.dragInitialPosition - mousePosition) * this.dragSpeed, this.minScroll, this.maxScroll);
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
    applyScroll(element, scroll) {
        const containerStyle = window.getComputedStyle(this.container);
        const containerTransformStyle = new WebKitCSSMatrix(containerStyle.transform);
        const containerTranslateX = containerTransformStyle.e;
        const containerTranslateY = containerTransformStyle.f;
        //applying the transform based on the scorll direction
        if (this.direction === 'vertical') {
            element.style.transform = `translateY(${-scroll}px) translateX(${containerTranslateX}px)`;
        }
        else if (this.direction === 'horizontal') {
            element.style.transform = `translateY(${containerTranslateY}px) translateX(${-scroll}px)`;
        }
        //settting the currentScroll for the element
        element.dataset.currentScroll = scroll.toString();
    }
    /**
     * Return the current scroll of each scroledElements
     *
     * @returns {Array<{element: HTMLElement, currentScroll: number}>[]} The current scroll for each element
     */
    getCurrentScroll() {
        let currentScrolls = [];
        this.scrolledElements.forEach(element => {
            currentScrolls.push({
                element,
                currentScroll: parseFloat(element.dataset.currentScroll)
            });
        });
        return currentScrolls;
    }
    /**
     * Scroll to a specified element
     *
     * @param {HTMLElement} element The element to scroll to
     * @param {ScrollTo} options The options of the scrollTo
     */
    scrollTo(element, options = {
        align: 'start',
        margin: 0
    }) {
        if (!element)
            console.error('scrollTo element is undefined');
        const rect = element.getBoundingClientRect();
        let scrollDistance;
        if (options.align === 'start') {
            scrollDistance = rect.top - (0, utils_1.convertToPx)(options.margin, this.direction);
        }
        else if (options.align === 'end') {
            scrollDistance = rect.bottom - window.innerHeight + (0, utils_1.convertToPx)(options.margin, this.direction);
        }
        else {
            console.error("Align option is invalid, only possible values are 'start' and 'end'");
        }
        let currentScroll;
        this.scrolledElements.forEach(element => {
            currentScroll = (0, utils_1.clamp)(scrollDistance, this.minScroll, this.maxScroll);
            this.applyScroll(element, currentScroll);
        });
    }
    /**
     * Activate the ability to scroll
     */
    allowScroll() {
        this.canScroll = true;
    }
    /**
     * Disable the ability to scroll
     */
    disableScroll() {
        this.canScroll = false;
    }
    /**
     * Toggle the scroll. If it was true will become false, and vice versa
     */
    toggleScroll() {
        this.canScroll = !this.canScroll;
    }
    /**
     * Allow the drag ability (draggable must be set to true)
     */
    allowDrag() {
        if (this.draggable)
            this.canDrag = true;
    }
    /**
     * Disable the drag ability (draggable must be set to true)
     */
    disableDrag() {
        if (this.draggable)
            this.canDrag = false;
    }
    /**
     * Toggle the scroll. If it was true will become false, and vice versa (draggable must be set to true)
     */
    toggleDrag() {
        if (this.draggable)
            this.canDrag = !this.canDrag;
    }
}
exports.Scrolleo = Scrolleo;
