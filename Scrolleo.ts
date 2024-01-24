/**
 * The scroll class
 */
export class Scrolleo {
  /** The element to apply the scroll */
  element: HTMLElement;
  /** The easing of the scroll */
  ease: string;
  /** The direction of the scroll */
  direction: "horizontal" | "vertical";
  /** Linear interpolation intensity of the scroll (between 0 and 1) */
  lerp: number;
  /** If the scroll can be dragged too */
  draggable: boolean;
  /** If we throttle the scroll */
  throttle: boolean;
  /** The delay at which the scroll is throttled */
  throttleDelay: number;
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
   */
  constructor(
    element: HTMLElement,
    ease: string = "cubic-bezier(.19,.57,.51,.99)",
    direction: "horizontal" | "vertical" = "horizontal",
    lerp: number = 0.25,
    draggable: boolean = true,
    throttle: boolean = true,
    throttleDelay: number = 150
  ) {
    this.element = element;
    this.ease = ease;
    this.direction = direction;
    this.lerp = lerp;
    this.draggable = draggable;
    this.throttle = throttle;
    this.throttleDelay = throttleDelay;
  }

  /**
   * Initializing Scrolleo
   */
  init(): void {
    this.maxScroll = this.element.getBoundingClientRect().width;

    this.setListener();

    this.canScroll = true;
  }

  /**
   * Setting all the listeners for the scroll and drag
   */
  setListener(): void {
    this.element.addEventListener(
      "wheel",
      (e) => {
        if (this.canScroll) {
          if (this.throttle) this.throttleScroll();
        }
      },
      {
        signal: this.wheelSignal,
      }
    );

    if (this.draggable) {
      this.element.addEventListener("mousedown", (e) => {}, {
        signal: this.dragSignal,
      });

      this.element.addEventListener("mousemove", (e) => {}, {
        signal: this.dragSignal,
      });

      this.element.addEventListener("mouseup", (e) => {}, {
        signal: this.dragSignal,
      });

      this.element.addEventListener("mouseleave", (e) => {}, {
        signal: this.dragSignal,
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
