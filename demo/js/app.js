angular.module('demo', ['ngHtmlWindow'])
    .controller("demoCtrl", function($scope) {

        $scope.windows = [];

        $scope.windows[0] = 1;

    });