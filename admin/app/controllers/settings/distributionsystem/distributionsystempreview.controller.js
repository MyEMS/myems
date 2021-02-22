'use strict';

app.controller('DistributionSystemPreviewController', function($scope,$common, $translate,  DistributionSystemService, DistributionCircuitService) {
      $scope.distributionsystems = [];
      $scope.currentDistributionSystem = null;

      $scope.getAllDistributionSystems = function() {
      DistributionSystemService.getAllDistributionSystems(function(error, data) {
        if (!error) {
          $scope.distributionsystems = data;
          } else {
          $scope.distributionsystems = [];
         }
      });
    };

    $scope.getDistributionCircuitsByDistributionSystemID = function(id) {

  			DistributionCircuitService.getDistributionCircuitsByDistributionSystemID(id, function(error, data) {
  				if (!error) {
  				 return data;
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
