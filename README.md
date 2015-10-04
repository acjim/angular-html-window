# Angular HTML Window
This is a AngularJS module that provides a draggable and resizable window directive.  
Based on https://github.com/rlamana/Ventus

## How to use

### Install via npm
TODO

### Include in your project
Include the css and javascript in your html file.
```html
  <link rel="stylesheet" type="text/css" href="path/to/library/ngHtmlWindow.css" />
  <script type="text/javascript" src="path/to/library/ngHtmlWindow.js" />
```
And include it as a dependency in your application.
```javascript
angular.module('demo', ['ngHtmlWindow']);
```



## Events
Events are broadcast on the scope where the window is attached. This means they are available to any controller inside of the ng-html-window container.

### ngWindow.resize
Dispatched when a window is resized, debounced to occur only every 50ms.
```javascript
$scope.$on('ngWindow.resize', function(e, windowObject){});
```

### ngWindow.active
Only one window can have the focus. When a window gets focused (by clicking it), a broadcast with a reference to the window is sent to all child scopes:
```javascript
$scope.$on('ngWindow.active', function(e, windowObject(){});
```
### ngWindow.inactive
The same goes for when a window looses the focus:
```javascript
$scope.$on('ngWindow.inactive', function(e, windowObject(){});
```
