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
    constructor({ element, ease = 'cubic-bezier(0.19,0.57,0.51,0.99)', direction = 'vertical', smoothness = 0.25, draggable = true, throttle = true, throttleDelay = 100, scrollPercentage = 20 }) {
        /** The minimum scroll the user can do in pixels */
        this.minScroll = 0;
        /** The maximum scroll the user can do in pixels */
        this.maxScroll = 0;
        /** If the user can scroll (to throttle the scroll mostly) */
        this.canScroll = false;
        /** The wheel event abort signal  */
        this.wheelSignal = new AbortController();
        /** The drag abort signal */
        this.dragSignal = new AbortController();
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
    init() {
        this.maxScroll = this.calculateMaxScroll();
        //creating an observer to change element's speed if it is visible
        const observer = new MutationObserver(this.setElementsSpeed);
        observer.observe(this.element, { childList: true, subtree: true, attributes: true, attributeFilter: ['style'] });
        //initializing the element's speed
        this.setElementsSpeed();
        //setting the elements transitions
        this.element.querySelectorAll(':scope > *').forEach(child => {
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
    destroy() {
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
     * Calculate the max possible scroll based on the scroll direction
     *
     * @returns {number} The max possible scroll in pixels
     */
    calculateMaxScroll() {
        if (this.direction === 'vertical') {
            return -this.element.getBoundingClientRect().height;
        }
        else {
            return -this.element.getBoundingClientRect().width;
        }
    }
    /**
     * If the element is visible on the screen
     *
     * @param {Element} element The element to check
     * @returns {boolean} If the element is visible or not
     */
    elementVisible(element) {
        let elementInfos = element.getBoundingClientRect();
        let viewHeight = Math.max(window.innerHeight, document.documentElement.clientHeight);
        return !(elementInfos.bottom < 0 || elementInfos.top - viewHeight >= 0);
    }
    /**
     * Create the elements' scroll speed
     */
    setElementsSpeed() {
        this.element.querySelectorAll(':scope > *').forEach(child => {
            if (child.dataset.scrollSpeed && this.elementVisible(child)) {
                child.dataset.scrollStep = (0, utils_1.convertToPx)(this.scrollPercentage * parseFloat(child.dataset.scrollSpeed), this.direction).toString();
            }
            else {
                child.dataset.scrollStep = (0, utils_1.convertToPx)(this.scrollPercentage, this.direction).toString();
            }
        });
    }
    /**
     * Setting all the listeners for the scroll and drag
     */
    setListener() {
        this.element.addEventListener('wheel', e => {
            if (this.canScroll) {
                if (this.throttle)
                    this.throttleScroll();
                this.calculateScroll(e.deltaY);
            }
        }, {
            signal: this.wheelSignal.signal
        });
        if (this.draggable) {
            this.element.addEventListener('mousedown', e => { }, {
                signal: this.dragSignal.signal
            });
            this.element.addEventListener('mousemove', e => { }, {
                signal: this.dragSignal.signal
            });
            this.element.addEventListener('mouseup', e => { }, {
                signal: this.dragSignal.signal
            });
            this.element.addEventListener('mouseleave', e => { }, {
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
        this.element.querySelectorAll(':scope > *').forEach(child => {
            let currentScroll;
            //calculating the scroll depending on the direction the user scroll (up or down)
            if (deltaY > 0) {
                currentScroll = (0, utils_1.clamp)(parseFloat(child.dataset.currentScroll) - parseFloat(child.dataset.scrollStep), this.minScroll, this.maxScroll);
            }
            else {
                currentScroll = (0, utils_1.clamp)(parseFloat(child.dataset.currentScroll) + parseFloat(child.dataset.scrollStep), this.minScroll, this.maxScroll);
            }
            this.applyScroll(child, currentScroll);
        });
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
            element.style.transform = `translateY(${scroll}px) translateX(${containerTranslateX}px)`;
        }
        else if (this.direction === 'horizontal') {
            element.style.transform = `translateY(${containerTranslateY}px) translateX(${scroll}px)`;
        }
        //settting the currentScroll for the element
        element.dataset.currentScroll = scroll.toString();
    }
}
exports.Scrolleo = Scrolleo;
