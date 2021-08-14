'use strict';
app.factory('EnergyFlowDiagramNodeService', function($http) {
    return {
        getNodesByEnergyFlowDiagramID: function(id, callback) {
            $http.get(getAPI()+'energyflowdiagrams/'+id+'/nodes')
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        addEnergyFlowDiagramNode: function(energyflowdiagramID, energyflowdiagramnode,callback) {
            $http.post(getAPI()+'energyflowdiagrams/'+energyflowdiagramID+'/nodes',{data:energyflowdiagramnode})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        editEnergyFlowDiagramNode: function(energyflowdiagramID,energyflowdiagramnode,callback) {
            $http.put(getAPI()+'energyflowdiagrams/'+energyflowdiagramID+'/nodes/'+energyflowdiagramnode.id,{data:energyflowdiagramnode})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        deleteEnergyFlowDiagramNode: function(energyflowdiagramID, nodeID, callback) {
            $http.delete(getAPI()+'energyflowdiagrams/'+energyflowdiagramID+'/nodes/'+nodeID)
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
    };
});
