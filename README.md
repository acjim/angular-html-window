# Angular HTML Window
This is a AngularJS module that provides a draggable and resizable window directive.

## Events
Events are broadcast on the scope where the window is attached. This means they are available to any controller inside of the ng-html-window container.

### ngWindow.resize
Dispatched when a window is resized, debounced to occur only every 50ms.
```javascript
$scope.$on('ngWindow.resize', function(e, windowObject){});
```

### Focus
Only one window can have the focus. When a window gets focused (by clicking it), a broadcast with a reference to itself is sent to all child scopes:
```javascript
$scope.$broadcast('active', this);
```

The same goes for when a window looses the focus:
```javascript
$scope.$broadcast('active', this);
```
