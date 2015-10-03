angular.module('demo', ['ngHtmlWindow'])
    .controller("demoCtrl", function($scope) {

        $scope.windows = [];

        $scope.windows[0] = {
            options: {
                title: 'lol',
                onClose: function() {
                    console.log("close function");

                    var windows = $scope.windows;
                    var index = windows.indexOf(this);
                    windows.splice(index, 1);

                    console.log($scope.windows);
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
                    console.log("close function");

                    var windows = $scope.windows;
                    var index = windows.indexOf(this);
                    windows.splice(index, 1);

                    console.log($scope.windows);
                }
            }
        };

        $scope.$watch($scope.windows, function () {
            console.log($scope.windows);
        });

    });