'use strict';

// SVG Preview controller - CRUD and settings management

app.controller('SVGPreviewController', function($scope, $window, SVGService) {
    $scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));
      $scope.svgs = [];
      $scope.currentSVG = null;

      // Load all sv gs from API
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

    // Handle svg change. Stored source is rebuilt without script or event handlers.
    $scope.changeSVG=function(item,model){
        $scope.currentSVG=item;
        $scope.currentSVG.selected=model;
        renderSanitizedSvgPreview(
            document.getElementById("preview-svg"),
            $scope.currentSVG ? $scope.currentSVG.source_code : null
        );
    };

    $scope.getAllSVGs();

  	$scope.$on('handleBroadcastSVGChanged', function(event) {
      $scope.getAllSVGs();
  	});

});
