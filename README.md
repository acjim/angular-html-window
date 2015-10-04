# Angular HTML Window
This is a AngularJS module that provides a draggable and resizable window directive.  
Based on https://github.com/rlamana/Ventus

## How to use

### Install via npm
Install the package over npm.
```
npm i angular-html-window
```

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

### Creating a window
You can create windows by including the directive in your HTML. You can use ng-repeat to iterate through a collection.
```html
<ng-html-window options="options" ng-repeat="window in windows">
 <!--your content goes here-->
</ng-html-window>
```

### Options
You can specify options and handlers in the options object. These are the standard values:
```javascript
options = {
    title: 'Untitled window's,
    width: 400,
    height: 200,
    x: 0,
    y: 0,
    minWidth: 200,
    maxWidth: Infinity,
    minHeight: 100,
    maxHeight: Infinity,
    resizable: true,
    appendTo: element.parent(),
    onClose: function() {
        return true;
    }
};
```
**Important:** When using ng-repeat, you should provide a onClose handler function that deletes the window from your collection.

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
