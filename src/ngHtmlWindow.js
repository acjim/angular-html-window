'use strict';

(function() {
    'use strict';

    angular.module('ngHtmlWindow', [])
        .directive('ngHtmlWindow', ['$document', ngHtmlWindow]);

    function ngHtmlWindow($document) {

        return {
            templateUrl: function(tElement, tAttrs) {
                return tAttrs.templateUrl || 'src/ngHtmlWindow.html';
            },
            restrict: 'E',
            replace: true,
            transclude: true,
            scope: {
                title: '@',
                options: '@'
            },
            link: function ($scope, element, attr) {

                // classNames
                var NG_WINDOW = ".ng-window",
                    NG_WINDOW_TITLE = ".ng-window-title",
                    NG_WINDOW_TITLEBAR = ".ng-window-titlebar",
                    NG_WINDOW_CONTENT = ".ng-window-content",
                    NG_WINDOW_RESIZEHANDLES = ".ng-window-resize";


                var Window = function (options) {

                    // Get references to window elements
                    this.appendTo = element.parent();
                    this.wndElement = element;
                    this.titleBar = angular.element(element[0].querySelectorAll(NG_WINDOW_TITLEBAR));
                    this.resizeHandles = angular.element(element[0].querySelectorAll(NG_WINDOW_RESIZEHANDLES));
                    this.title = angular.element(element[0].querySelectorAll(NG_WINDOW_TITLE));


                    // Add event listeners
                    this.appendTo.bind('mousemove', this.events.mousemove.bind(this));
                    this.appendTo.bind('mouseup', this.events.mouseup.bind(this));
                    this.titleBar.bind('mousedown', this.events.title_mousedown.bind(this));

                    for (var i = 0; i < this.resizeHandles.length; i++) {
                        angular.element(this.resizeHandles[i])
                            .bind('mousedown', this.events.resize_handler_mousedown.bind(this));
                    }


                    options = options || {
                            title: 'Untitled Window',
                            width: 400,
                            height: 200,
                            x: 0,
                            y: 0,
                            minWidth: 200,
                            maxWidth: Infinity,
                            minHeight: 100,
                            maxHeight: Infinity,

                            resizable: true
                        };

                    this.options = options;

                    // Dimensions
                    this.width = options.width;
                    this.height = options.height;

                    this.x = options.x;
                    this.y = options.y;
                    this.z = 10000;

                    // State
                    this.active = false;
                    this.maximized = false;
                    this.minimized = false;

                    this._closed = true;
                    this._destroyed = false;

                    // Properties
                    this.movable = true;
                    this.resizable = options.resizable;

                };

                Window.prototype = {

                    _resizing: null,
                    _moving: null,
                    _restore: null,
                    self: this,

                    events: {
                        resize_handler_mousedown: function(event) {

                            this._resizing = {
                                resizeDirection: event.currentTarget.className.replace("ng-window-resize ng-window-resize-", ""),
                                initialSize: {
                                    width: this.width,
                                    height: this.height
                                },
                                initialPosition: {
                                    top: this.y,
                                    left: this.x
                                }
                            };

                            angular.element($document[0].body).css('cursor', this._resizing.resizeDirection + '-resize');

                            event.preventDefault();

                        },
                        title_mousedown: function(e) {

                            this._moving = this.toLocal({
                                x: event.pageX,
                                y: event.pageY
                            });

                            e.preventDefault();
                        },
                        mousemove: function(event) {

                            // Fix mousemove outside browser
                            if (event.which !== 1) {
                                this._moving && this._stopMove();
                                this._resizing && this._stopResize();
                            }

                            if (this._moving) {
                                this.move(
                                    event.pageX - this._moving.x,
                                    event.pageY - this._moving.y
                                );
                            }

                            if(this._resizing) {

                                var resizeDirection = this._resizing.resizeDirection,
                                    initialPosition = this._resizing.initialPosition,
                                    initialSize = this._resizing.initialSize,
                                    newHeight,
                                    newWidth,
                                    windowRight,
                                    windowBottom,
                                    options = this.options,
                                    x = event.x,
                                    y = event.y;

                                if (resizeDirection.indexOf("e") > -1) {

                                    this.width = this.constrain(x - initialPosition.left, options.minWidth, options.maxWidth);

                                } else if (resizeDirection.indexOf("w") > -1) {

                                    windowRight = initialPosition.left + initialSize.width;
                                    newWidth = this.constrain(windowRight - x, options.minWidth, options.maxWidth);

                                    this.width = newWidth;
                                    this.x = windowRight - newWidth;

                                }


                                if (resizeDirection.indexOf("n") > -1) {            // resizing in north direction

                                    windowBottom = initialPosition.top + initialSize.height;
                                    newHeight = this.constrain(windowBottom - y, options.minHeight, options.maxHeight);

                                    this.y = windowBottom - newHeight;
                                    this.height = newHeight;

                                } else if (resizeDirection.indexOf("s") > -1) {     // resizing in south direction

                                    this.height = this.constrain(y - initialPosition.top, options.minHeight, options.maxHeight);

                                }

                            }
                        },
                        mouseup: function(event) {
                            this._moving && this._stopMove();
                            this._resizing && this._stopResize();
                        }
                    },
                    _stopMove: function() {
                        this._moving = null;
                    },

                    _stopResize: function() {
                        this._restore = null;
                        this._resizing = null;
                        angular.element($document[0].body).css('cursor', '');
                    },
                    set width(value) {
                        this.wndElement.css('width', value + 'px');
                    },

                    get width() {
                        return parseInt(this.wndElement.css('width'), 10);
                    },

                    set height(value) {
                        // This shouldn't be done if flexible box model
                        // worked properly with overflow-y: auto
                        //this.$content.height(value - this.$header.outerHeight());

                        this.wndElement.css('height', value + 'px');
                    },
                    get height() {
                        return parseInt(this.wndElement.css('height'), 10);
                    },
                    set x(value) {
                        this.wndElement.css('left', value + 'px');
                    },

                    set y(value) {
                        this.wndElement.css('top', value + 'px');
                    },

                    get x() {
                        return parseInt(this.wndElement.css('left'), 10);
                    },

                    get y() {
                        return parseInt(this.wndElement.css('top'), 10);
                    },
                    set resizable(value) {
                        this._resizable = !!value;
                    },

                    get resizable() {
                        return this._resizable;
                    },
                    resize: function(w, h) {
                        this.width = w;
                        this.height = h;
                        return this;
                    },
                    move: function(x, y) {
                        this.x = x;
                        this.y = y;
                        return this;
                    },
                    toLocal: function(coord) {
                        return {
                            x: coord.x - this.x,
                            y: coord.y - this.y
                        };
                    },
                    constrain: function(value, min, max) {
                        return Math.min(max, Math.max(min, value));
                    }

                };

                new Window();

            }
        };

    }

})();