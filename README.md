# Angular HTML Window
This is a AngularJS module that provides a draggable and resizable window directive.

## Events

### Focus
Only one window can have the focus. When a window gets focused (by clicking it), a broadcast with a reference to itself is sent to all child scopes:
```javascript
$scope.$broadcast('active', this);
```

The same goes for when a window looses the focus:
```javascript
$scope.$broadcast('active', this);
```
