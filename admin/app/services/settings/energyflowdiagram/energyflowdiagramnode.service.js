'use strict';
app.factory('EnergyFlowDiagramNodeService', function($http) {
    return {
        getNodesByEnergyFlowDiagramID: function(id, callback) {
            $http.get(getAPI()+'energyflowdiagrams/'+id+'/nodes')
                .success(function (response, status, headers, config) {
                    callback(null, response);
                })
                .error(function (e) {
                    callback(e);
                });
        },
        addEnergyFlowDiagramNode: function(energyflowdiagramID, energyflowdiagramnode,callback) {
            $http.post(getAPI()+'energyflowdiagrams/'+energyflowdiagramID+'/nodes',{data:energyflowdiagramnode})
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e) {
                    callback(e);
                });
        },
        editEnergyFlowDiagramNode: function(energyflowdiagramID,energyflowdiagramnode,callback) {
            $http.put(getAPI()+'energyflowdiagrams/'+energyflowdiagramID+'/nodes/'+energyflowdiagramnode.id,{data:energyflowdiagramnode})
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e) {
                    callback(e);
                });
        },

        deleteEnergyFlowDiagramNode: function(energyflowdiagramID, nodeID, callback) {
            $http.delete(getAPI()+'energyflowdiagrams/'+energyflowdiagramID+'/nodes/'+nodeID)
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e) {
                    callback(e);
                });
        },
    };
});
