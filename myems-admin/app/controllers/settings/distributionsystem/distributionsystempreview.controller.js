'use strict';

// Distributionsystempreview controller - SVG preview

app.controller('DistributionSystemPreviewController', function($scope, $window, DistributionSystemService, DistributionCircuitService) {
    $scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));
      $scope.distributionsystems = [];
      $scope.currentDistributionSystem = null;

      // Load all distribution systems from API
      $scope.getAllDistributionSystems = function() {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
      DistributionSystemService.getAllDistributionSystems(headers, function(response) {
          if (angular.isDefined(response.status) && response.status === 200) {
              $scope.distributionsystems = response.data;
          } else {
              $scope.distributionsystems = [];
          }
      });
    };

    // Load distribution circuits by distribution system id
    $scope.getDistributionCircuitsByDistributionSystemID = function(id) {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        DistributionCircuitService.getDistributionCircuitsByDistributionSystemID(id, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                return response.data;
            } else {
                return [];
            }
        });
  	};

    // Handle distribution system change. Stored source is rebuilt without script or event handlers.
    $scope.changeDistributionSystem=function(item,model){
        $scope.currentDistributionSystem=item;
        $scope.currentDistributionSystem.selected=model;
        var svg = $scope.currentDistributionSystem.svg;
        renderSanitizedSvgPreview(
            document.getElementById("preview-svg"),
            svg ? svg.source_code : null
        );
    };

    $scope.getAllDistributionSystems();

  	$scope.$on('handleBroadcastDistributionSystemChanged', function(event) {
      $scope.getAllDistributionSystems();
  	});

});
