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
  /** The minimum scroll the user can do */
  private minScroll: number = 0;
  /** The maximum scroll the user can do */
  private maxScroll: number
  /** If the user can scroll (to throttle the scroll mostly) */
  private canScroll: boolean = false;

  /**
   * Constructor
   */
  constructor(
    element: HTMLElement,
    ease: string = "cubic-bezier(.19,.57,.51,.99)",
    direction: "horizontal" | "vertical" = "horizontal",
    lerp: number = 0.25,
    draggable: boolean = true
  ) {
    this.element = element;
    this.ease = ease;
    this.direction = direction;
    this.lerp = lerp;
    this.draggable = draggable;
  }
}
