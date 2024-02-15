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

## Speed

To change an element's speed (must be a direct children of the scroll container) you just need to add an HTML attribute to that element

```HTML
<div data-scroll-speed="2"></div>
```

## Instance options

|Option|Type|Default|Description|
|---|---|---|---|
|`element`|`HTMLElement`||The Scroll container element|
|`ease`|`string`|`cubic-bezier(0.19,0.57,0.51,0.99)`|An easing method for the scroll 'animation'|
|`direction`|`string`|`vertical`|The scroll direction `vertical` or `horizontal` only|
|`smoothness`|`number`|`0.25`|The smoothness of the scroll, the higher the number the smoother the scroll|
|`draggable`|`boolean`|`false`|If we can drag to scroll|
|`throttle`|`boolean`|`true`|If the scroll is throttled so the user can't scroll for a specfic delay (great for Apple Magic Mouse and infinite wheel)|
|`throttleDelay`|`number`|`100`|The delay in milliseconds for which the user can't scroll|
|`scrollPercentage`|`number`|`20`|The percentage of the window that gets scrolled each time|

## Instance methods

|Method|Description|Arguments|
|---|---|---|
|`init()`|Initialize the scroll||
|`destroy()`|Destroy all the scroll events||

## Elements attributes

|Attribute|Type|Description|
|---|---|---|
|`data-scroll-speed`|`number`|Define the speed of the element (must be direct children of the scroll container)|