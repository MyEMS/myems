'use strict';

app.controller('SVGPreviewController', function($scope, $window, SVGService) {
    $scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));
      $scope.svgs = [];
      $scope.currentSVG = null;

      $scope.getAllSVGs = function() {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
      SVGService.getAllSVGs(headers, function(response) {
          if (angular.isDefined(response.status) && response.status === 200) {
              $scope.svgs = response.data;
          } else {
              $scope.svgs = [];
          }
      });
    };

    $scope.changeSVG=function(item,model){
        $scope.currentSVG=item;
        $scope.currentSVG.selected=model;
        document.getElementById("preview-svg").innerHTML = $scope.currentSVG.source_code;
    };

    $scope.getAllSVGs();

  	$scope.$on('handleBroadcastSVGChanged', function(event) {
      $scope.getAllSVGs();
  	});

});
