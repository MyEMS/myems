'use strict';

// Energy Flow Diagram Link service - REST API wrapper
app.factory('EnergyFlowDiagramLinkService', function($http) {
    return {

        // GET links by energy flow diagram id by ID
        getLinksByEnergyFlowDiagramID: function(id, headers, callback) {
            $http.get(getAPI()+'energyflowdiagrams/'+id+'/links', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // POST create energy flow diagram link
        addEnergyFlowDiagramLink: function(energyflowdiagramID, energyflowdiagramlink, headers, callback) {
            $http.post(getAPI()+'energyflowdiagrams/'+energyflowdiagramID+'/links',{data:energyflowdiagramlink}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // PUT update energy flow diagram link
        editEnergyFlowDiagramLink: function(energyflowdiagramID, energyflowdiagramlink, headers, callback) {
            $http.put(getAPI()+'energyflowdiagrams/'+energyflowdiagramID+'/links/'+energyflowdiagramlink.id,{data:energyflowdiagramlink}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // DELETE energy flow diagram link
        deleteEnergyFlowDiagramLink: function(energyflowdiagramID, linkID, headers, callback) {
            $http.delete(getAPI()+'energyflowdiagrams/'+energyflowdiagramID+'/links/'+linkID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
    };
});
