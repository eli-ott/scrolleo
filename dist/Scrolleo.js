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
    constructor({ element, ease = 'cubic-bezier(0.19,0.57,0.51,0.99)', direction = 'vertical', smoothness = 0.25, draggable = false, dragSpeed = 1, throttle = true, throttleDelay = 100, scrollPercentage = 20, offsetBottom = 0 }) {
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
        /** The wheel event abort signal  */
        this.wheelSignal = new AbortController();
        /** The drag abort signal */
        this.dragSignal = new AbortController();
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
    init() {
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
            element.dataset.scrollStep = (0, utils_1.convertToPx)(this.scrollPercentage, this.direction).toString();
        });
        this.setListener();
        this.canScroll = true;
    }
    /**
     * Reset the whole scroll and stops the event listeners
     */
    destroy() {
        document.querySelector('body').style.overflow = 'scroll';
        this.canScroll = false;
        this.maxScroll = 0;
        this.removeListeners();
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
        this.element.querySelectorAll(':scope > *').forEach(element => {
            this.scrolledElements.push(element);
        });
        this.element.querySelectorAll(':scope > * [data-scroll-speed]').forEach(element => {
            this.scrolledElements.push(element);
        });
    }
    /**
     * Calculate the max possible scroll based on the scroll direction
     *
     * @returns {number} The max possible scroll in pixels
     */
    calculateMaxScroll() {
        if (this.direction === 'vertical') {
            return (this.element.getBoundingClientRect().height +
                this.element.getBoundingClientRect().top -
                window.innerHeight -
                (0, utils_1.convertToPx)(this.offsetBottom, this.direction));
        }
        else if (this.direction === 'horizontal') {
            return (this.element.getBoundingClientRect().width +
                this.element.getBoundingClientRect().left -
                window.innerWidth -
                (0, utils_1.convertToPx)(this.offsetBottom, this.direction));
        }
        else {
            console.error("Scroll direction is not valid, only possible values are 'vertical' and 'horizontal'");
            throw new Error("Scroll direction is not valid, only possible values are 'vertical' and 'horizontal'");
        }
    }
    /**
     * Create the scroll animation for the element
     *
     * @param {HTMLElement} element The element to apply the transition to
     */
    setTransition(element) {
        let elementTransition = element.computedStyleMap().get('transition');
        element.style.transition = `${elementTransition}, transform ${this.smoothness}s ${this.ease}`;
    }
    /**
     * Setting all the listeners for the scroll and drag
     */
    setListener() {
        //avoid the default scroll on other elements
        document.querySelector('body').style.overflow = 'hidden';
        this.element.addEventListener('wheel', e => {
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
            this.element.addEventListener('mousedown', e => {
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
            this.element.addEventListener('mousemove', e => {
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
            this.element.addEventListener('mouseup', () => {
                //allowing the user to sroll again
                this.canScroll = true;
                //preventing the user to drag
                this.canDrag = false;
                //reseting the initial drag position
                this.dragInitialPosition = 0;
            }, {
                signal: this.dragSignal.signal
            });
            this.element.addEventListener('mouseleave', () => {
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
        const containerStyle = window.getComputedStyle(this.element);
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
     * Scroll a percentage of the window
     *
     * @param {number} percentage The percentage of the window to scroll
     */
    scroll(percentage) {
        let currentScroll;
        this.scrolledElements.forEach(element => {
            currentScroll = (0, utils_1.clamp)((0, utils_1.convertToPx)(percentage, this.direction), this.minScroll, this.maxScroll);
            this.applyScroll(element, currentScroll);
        });
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
}
exports.Scrolleo = Scrolleo;
