# Scrolleo

A new and easy way to have a smooth scroll in your website

## Installation

```
npm install scrolleo
```

## Usage

A basic smooth scroll with default settings

First you need to import it inside your node project

```JS
import { Scrolleo } from 'scrolleo';
```

**Javascript**

```JS
const scrolleo = new Scrolleo({
	element: document.querySelector('your-element'),
});
scrolleo.init();
```

**Typescript**

```TS
const scrolleo = new Scrolleo({
	element: document.querySelector<HTMLElement>('your-element')!,
});
scrolleo.init();
```

## Instance options

| Option             | Type                  | Default                             | Description                                                                                                              |
| ------------------ | --------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `element`          | `HTMLElement`         |                                     | The Scroll container element                                                                                             |
| `ease`             | `string`              | `cubic-bezier(0.19,0.57,0.51,0.99)` | An easing method for the scroll 'animation'                                                                              |
| `direction`        | `string`              | `vertical`                          | The scroll direction `vertical` or `horizontal` only                                                                     |
| `smoothness`       | `number`              | `0.25`                              | The smoothness of the scroll, the higher the number the smoother the scroll                                              |
| `draggable`        | `boolean`             | `false`                             | If we can drag to scroll                                                                                                 |
| `dragSpeed`        | `number`              | `1`                                 | The drag speed. Eg. A drag speed of `2` would mean that for every pixel dragged, the element get scrolled 2 pixels       |
| `throttle`         | `boolean`             | `true`                              | If the scroll is throttled so the user can't scroll for a specfic delay (great for Apple Magic Mouse and infinite wheel) |
| `throttleDelay`    | `number`              | `100`                               | The delay in milliseconds for which the user can't scroll                                                                |
| `scrollPercentage` | `number`              | `20`                                | The percentage of the window that gets scrolled each time                                                                |
| `offsetBottom`     | `number`              | `0`                                 | The percentage of the window to remove at the end of the scroll                                                          |
| `elementsToScroll` | `Array<HTMLElements>` | `null`                              | The elements to scroll, if null will be the direct children of the container.                                            |

## Instance methods

| Method           | Description                                  | Arguments                                                                                                                                                                                                                                                                                                                                                                                                     |
| ---------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `init()`         | Initialize the scroll                        |                                                                                                                                                                                                                                                                                                                                                                                                               |
| `destroy()`      | Destroy all the scroll events                |                                                                                                                                                                                                                                                                                                                                                                                                               |
| `scroll()`       | Scroll a specific percentage of the window   | `percentage` The amount you want to scroll, must be a number                                                                                                                                                                                                                                                                                                                                                  |
| `scrollTo()`     | Scroll to a specified element                | <div>`element` The element to scroll to, must be an HTMLElement <br>`options` The options to the scroll : <ul><li>`align` If the element to scroll to should be at the end or at the start of the window (relative to the scroll direction), must be either `start` or `end`</li><li>`margin` The percentage of the window to let between the screen border and the element, must be a number</li></ul></div> |
| `isInit()`       | Check wheter Scrolleo was initialized or not |                                                                                                                                                                                                                                                                                                                                                                                                               |
| `getMaxScroll()` | Return the calculated max scroll             |                                                                                                                                                                                                                                                                                                                                                                                                               |
