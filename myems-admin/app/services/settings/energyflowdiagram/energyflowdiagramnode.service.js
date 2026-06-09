'use strict';

// Energy Flow Diagram Node service - REST API wrapper
app.factory('EnergyFlowDiagramNodeService', function($http) {
    return {
        // GET nodes by energy flow diagram id by ID
        getNodesByEnergyFlowDiagramID: function(id, headers, callback) {
            $http.get(getAPI()+'energyflowdiagrams/'+id+'/nodes', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // POST create energy flow diagram node
        addEnergyFlowDiagramNode: function(energyflowdiagramID, energyflowdiagramnode, headers, callback) {
            $http.post(getAPI()+'energyflowdiagrams/'+energyflowdiagramID+'/nodes',{data:energyflowdiagramnode}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // PUT update energy flow diagram node
        editEnergyFlowDiagramNode: function(energyflowdiagramID, energyflowdiagramnode, headers, callback) {
            $http.put(getAPI()+'energyflowdiagrams/'+energyflowdiagramID+'/nodes/'+energyflowdiagramnode.id,{data:energyflowdiagramnode}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // DELETE energy flow diagram node
        deleteEnergyFlowDiagramNode: function(energyflowdiagramID, nodeID, headers, callback) {
            $http.delete(getAPI()+'energyflowdiagrams/'+energyflowdiagramID+'/nodes/'+nodeID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
    };
});
