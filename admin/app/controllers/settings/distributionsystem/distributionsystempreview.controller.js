'use strict';

app.controller('DistributionSystemPreviewController', function($scope, DistributionSystemService, DistributionCircuitService) {
      $scope.distributionsystems = [];
      $scope.currentDistributionSystem = null;

      $scope.getAllDistributionSystems = function() {
      DistributionSystemService.getAllDistributionSystems(function(response) {
          if (angular.isDefined(response.status) && response.status === 200) {
              $scope.distributionsystems = response.data;
          } else {
              $scope.distributionsystems = [];
          }
      });
    };

    $scope.getDistributionCircuitsByDistributionSystemID = function(id) {
        DistributionCircuitService.getDistributionCircuitsByDistributionSystemID(id, function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                return response.data;
            } else {
                return [];
            }
        });
  	};

    $scope.changeDistributionSystem=function(item,model){
        $scope.currentDistributionSystem=item;
        $scope.currentDistributionSystem.selected=model;
        document.getElementById("preview-svg").innerHTML = $scope.currentDistributionSystem.svg;
    };

    $scope.getAllDistributionSystems();

  	$scope.$on('handleBroadcastDistributionSystemChanged', function(event) {
      $scope.getAllDistributionSystems();
  	});

});
