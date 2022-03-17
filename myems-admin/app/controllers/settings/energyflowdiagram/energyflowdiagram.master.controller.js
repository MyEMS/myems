'use strict';

app.controller('EnergyFlowDiagramMasterController', function($scope) {

		$scope.$on('handleEmitEnergyFlowDiagramChanged', function(event) {
			$scope.$broadcast('handleBroadcastEnergyFlowDiagramChanged');
		});

		$scope.$on('handleEmitEnergyFlowDiagramNodeChanged', function(event) {
			$scope.$broadcast('handleBroadcastEnergyFlowDiagramNodeChanged');
		});

		$scope.$on('handleEmitEnergyFlowDiagramLinkChanged', function(event) {
			$scope.$broadcast('handleBroadcastEnergyFlowDiagramLinkChanged');
		});

});
