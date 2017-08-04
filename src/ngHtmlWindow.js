'use strict';

(function() {
    'use strict';

    angular.module('ngHtmlWindow', [])
        .service('ngWindowManager', ngWindowManager);

    function ngWindowManager() {

        var windows = [];

        var currentZ = null,
            baseZ = 1000,
            maxZ = 2000;

        return {
            getCurrentZValue: getCurrentZValue,
            addWindow: addWindow,
            closeWindow: closeWindow,
            focus: focus
        };

        //////////////////

        function getCurrentZValue() {
            if (!currentZ) {
                currentZ = baseZ;
            }
            return currentZ++;
        }

        function addWindow(win) {
            windows.push(win);
            win.focus();
        }

        function closeWindow(win) {
            //Remove window from array
            var id = windows.indexOf(win);
            windows.splice(id, 1);

            //Set new active window
            var length = windows.length;
            if (length > 0) {
                windows[windows.length - 1].focus();
            }
        }

        function focus(win) {

            //Remove window from array and add it to the top of it
            var index = windows.indexOf(win);
            windows.splice(index, 1);
            windows.push(win);

            for (var i = 0; i < windows.length; i++) {
                windows[i].blur();
            }

            win.z = getCurrentZValue();

            // Reset z values if it exceeds maxZ
            if (currentZ > maxZ) {

                currentZ = baseZ;

                for(var i = 0; i < windows.length; i++) {
                    windows[i].z = getCurrentZValue();
                }

            }


        }

    }

    angular.module('ngHtmlWindow')
        .directive('ngHtmlWindow', ['$document', '$window', '$timeout', 'ngWindowManager', ngHtmlWindow]);

    function ngHtmlWindow($document, $window, $timeout, ngWindowManager) {

        return {
            template: "<div class=\"ng-window\">"
                   + "    <div class=\"ng-window-titlebar\">"
                   + "        <span class=\"ng-window-title\">{{wnd.title}}<\/span>"
                   + "        <div class=\"ng-window-actions\">"
                   + "            <a role=\"button\">"
                   + "                <span id=\"ng-window-maximize\""
                   + "                      ng-class=\"{'ng-window-icon ng-window-maximize': !wnd.maximized, 'ng-window-icon ng-window-contract': wnd.maximized }\">"
                   + "                <\/span>"
                   + "            <\/a>"
                   + "            <a role=\"button\">"
                   + "                <span class=\"ng-window-icon ng-window-close\"><\/span>"
                   + "            <\/a>"
                   + "        <\/div>"
                   + "    <\/div>"
                   + "    <div class=\"ng-window-content\">"
                   + "        <div ng-transclude=\"true\"><\/div>"
                   + "    <\/div>"
                   + "    <div class=\"ng-window-resize ng-window-resize-n\"><\/div>"
                   + "    <div class=\"ng-window-resize ng-window-resize-e\"><\/div>"
                   + "    <div class=\"ng-window-resize ng-window-resize-s\"><\/div>"
                   + "    <div class=\"ng-window-resize ng-window-resize-w\"><\/div>"
                   + "    <div class=\"ng-window-resize ng-window-resize-se\"><\/div>"
                   + "    <div class=\"ng-window-resize ng-window-resize-sw\"><\/div>"
                   + "    <div class=\"ng-window-resize ng-window-resize-ne\"><\/div>"
                   + "    <div class=\"ng-window-resize ng-window-resize-nw\"><\/div>"
                   + "<\/div>",
            restrict: 'E',
            replace: true,
            transclude: true,
            scope: {
                options: '='
            },
            link: function ($scope, element) {

                // classNames
                var NG_WINDOW_TITLEBAR = ".ng-window-titlebar",
                    NG_WINDOW_RESIZEHANDLES = ".ng-window-resize",
                    NG_WINDOW_MAXIMIZE = "#ng-window-maximize",
                    NG_WINDOW_CLOSE = ".ng-window-close";

                var resizeHandlesSmoothValue = 3,
                    debounceEvent = null;

                // prevent error if no options object was passed
                var options = options || {};

                var Window = function (options) {

                    this.options = {
                        title: options.title || 'Untitled Window',
                        width: options.width || 400,
                        height: options.height || 200,
                        x: options.x || 0,
                        y: options.y || 0,
                        minWidth: options.minWidth || 200,
                        maxWidth: options.maxWidth || Infinity,
                        minHeight: options.minHeight || 100,
                        maxHeight: options.maxHeight || Infinity,
                        resizable: options.resizable || true,
                        appendTo: options.appendTo || element.parent(),


                        onOpen: options.onOpen || null,
                        onClose: options.onClose || function() {
                            return true;
                        },
                        onResize: options.onResize || function() {
                            if (options.onResize) { options.onResize() }
                        },
                        onActivate: options.onActivate || null,
                        onDeactivate: options.onDeactivate || null,
                        onDragstart: options.onDragstart ||null,
                        onDragend: options.onDragend || null
                    };


                    // Get references to window elements
                    this.w = angular.element($window);
                    this.appendTo = this.options.appendTo;
                    this.wndElement = element;
                    this.titleBar = angular.element(element[0].querySelector(NG_WINDOW_TITLEBAR));
                    this.resizeHandles = angular.element(element[0].querySelectorAll(NG_WINDOW_RESIZEHANDLES));
                    this.maximizeButton = angular.element(element[0].querySelector(NG_WINDOW_MAXIMIZE));
                    this.closeButton = angular.element(element[0].querySelector(NG_WINDOW_CLOSE))

                    // Add event listeners
                    this.appendTo.bind('mousemove', this.events.mousemove.bind(this));
                    this.appendTo.bind('mouseup', this.events.mouseup.bind(this));
                    this.titleBar.bind('mousedown', this.events.title_mousedown.bind(this));
                    this.closeButton.bind('click', this.events.close.bind(this));
                    this.wndElement.bind('mousedown', this.events.wnd_mousedown.bind(this));
                    this.maximizeButton.bind('click', this.events.maximize.bind(this));
                    this.resizeHandles.bind('mousedown', this.events.resize_handler_mousedown.bind(this));
                    this.w.bind('resize', this.events.windowResize.bind(this));

                    // Dimensions
                    this.width = this.options.width;
                    this.height = this.options.height;

                    this.x = this.options.x;
                    this.y = this.options.y;
                    this.z = ngWindowManager.getCurrentZValue();

                    this.title = this.options.title;

                    // State
                    this.active = false;
                    this.maximized = false;

                    // Properties
                    this.resizable = this.options.resizable;
                    this.movable = true;

                    ngWindowManager.addWindow(this);

                };

                Window.prototype = {

                    _resizing: null,
                    _moving: null,
                    _restore: null,

                    events: {
                        wnd_mousedown: function(event) {
                            this.focus();
                        },
                        resize_handler_mousedown: function(event) {

                            this._resizing = {
                                resizeDirection: event.currentTarget.className.replace("ng-window-resize ng-window-resize-", ""),
                                offset: this.wndElement[0].getBoundingClientRect(),
                                containerOffset: this.appendTo[0].getBoundingClientRect()
                            };

                            angular.element($document[0].body).css('cursor', this._resizing.resizeDirection + '-resize');

                            event.preventDefault();

                        },
                        title_mousedown: function(event) {

                            if (this.movable) {
                                this._moving = this.toLocal({
                                    x: event.pageX,
                                    y: event.pageY
                                });
                            }

                            event.preventDefault();
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
                                    offset = this._resizing.offset,
                                    containerOffset = this._resizing.containerOffset,
                                    newHeight,
                                    newWidth,
                                    newY,
                                    newX,
                                    windowRight,
                                    windowBottom,
                                    options = this.options,
                                    x = event.x || event.clientX,
                                    y = event.y || event.clientY;


                                // resizing in east west direction
                                if (resizeDirection.indexOf("e") > -1) {

                                    newWidth = this.constrain(x - offset.left + resizeHandlesSmoothValue, options.minWidth, options.maxWidth);

                                } else if (resizeDirection.indexOf("w") > -1) {

                                    windowRight = offset.left + offset.width;

                                    newWidth = this.constrain(windowRight - x - resizeHandlesSmoothValue, options.minWidth, options.maxWidth);
                                    newX = windowRight - newWidth - containerOffset.left;

                                }


                                // resizing in north south direction
                                if (resizeDirection.indexOf("n") > -1) {

                                    windowBottom = offset.top + offset.height;

                                    newHeight = this.constrain(windowBottom - y, options.minHeight, options.maxHeight);
                                    newY = windowBottom - newHeight - containerOffset.top;


                                } else if (resizeDirection.indexOf("s") > -1) {

                                    newHeight = this.constrain(y - offset.top, options.minHeight, options.maxHeight);

                                }

                                this.resize(newWidth, newHeight);
                                this.move(newX, newY);

                                this.options.onResize();

                            }
                        },
                        mouseup: function() {
                            this._moving && this._stopMove();
                            this._resizing && this._stopResize();
                        },
                        maximize: function() {

                            if(this.active) {
                                this.maximized = !this.maximized;
                                $scope.$apply(function() {
                                    $scope.maximized;
                                });
                            }
                        },
                        windowResize: function() {

                            var parent;

                            // Resize maximized windows with the browser window
                            if (this.maximized) {
                                parent = this.appendTo[0].getBoundingClientRect();
                                this.resize(parent.width, parent.height);
                            }

                        },
                        close: function() {

                            var options = this.options;

                            ngWindowManager.closeWindow(this);

                            options.onClose();

                            this.wndElement.remove();
                            $scope.$destroy();

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

                        if (value) {
                            this.resizeHandles.css('display', '');
                        } else {
                            //Remove resize listeners
                            this.resizeHandles.css('display', 'none');
                        }

                        this._resizable = value;
                    },
                    get resizable() {
                        return this._resizable;
                    },
                    set title(value) {
                        this._title = value;
                    },
                    get title() {
                        return this._title;
                    },
                    set active(value) {

                        if(value) {

                            // Don't execute that code, if it is already active
                            if (!this._active) {
                                //Set all other windows inactive
                                ngWindowManager.focus(this);

                                $scope.$broadcast('ngWindow.active', this);

                                this.wndElement.addClass('active');
                                this.wndElement.removeClass('inactive');
                            }

                        } else {
                            $scope.$broadcast('ngWindow.inactive', this);

                            this.wndElement.removeClass('active');
                            this.wndElement.addClass('inactive');
                        }

                        this._active = value

                    },
                    get active() {
                        return this._active;
                    },
                    set z(value) {
                        this.wndElement.css('z-index', value);
                        this._z = value;
                    },
                    get z() {
                        return this._z;
                    },
                    focus: function() {
                        this.active = true;
                        return this;
                    },
                    blur: function() {
                        this.active = false;
                        return this;
                    },
                    get maximized() {
                        return this._maximized;
                    },
                    set maximized(value) {

                        var appendTo = this.appendTo[0];

                        if(value) {

                            this._restore = this.stamp();

                            this.movable = !value;
                            this.resizable = !value;

                            this.move(0,0);
                            this.resize(appendTo.offsetWidth, appendTo.offsetHeight);

                        } else {

                            if (this._restore) {
                                var position = this._restore.position,
                                    size = this._restore.size;

                                this.movable = this._restore.movable;
                                this.resizable = this._restore.resizable;

                                this.move(position.x, position.y);
                                this.resize(size.width, size.height);
                            }

                        }
                        this._maximized = value;

                    },
                    get movable() {
                        return this._movable;
                    },
                    set movable(value) {
                        if (value) {
                            this.titleBar.css('cursor', 'move');
                        } else {
                            this.titleBar.css('cursor', '');
                        }
                        this._movable = value;
                    },
                    stamp: function() {
                        return {
                            position: {
                                x: this.x,
                                y: this.y
                            },
                            size: {
                                width: this.width,
                                height: this.height
                            },
                            movable: this.movable,
                            resizable: this.resizable
                        };
                    },
                    resize: function(w, h) {

                        // broadcast an event that resize happened (debounced to 50ms)
                        if(debounceEvent) $timeout.cancel(debounceEvent);
                        debounceEvent = $timeout(function() {
                            $scope.$broadcast('ngWindow.resize', this);
                            debounceEvent = null;
                        }, 50);

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

                $scope.wnd = new Window($scope.options);

            }
        };

    }

})();
