angular.module('demo', ['ngHtmlWindow'])
    .controller("demoCtrl", function($scope) {

        $scope.windows = [];

        $scope.windows[0] = {
            options: {
                title: 'Another Window',
                onClose: function() {
                    var windows = $scope.windows;
                    var index = windows.indexOf(this);
                    windows.splice(index, 1);
                }
            }
        };

        $scope.windows[1] = {
            options: {
                title: 'Test TITLE',
                height: 500,
                x: 100,
                y: 100,
                onClose: function() {
                    var windows = $scope.windows;
                    var index = windows.indexOf(this);
                    windows.splice(index, 1);
                }
            }
        };

        $scope.windows[2] = {
            options: {
                x: 500,
                y: 300
        }};

    });
