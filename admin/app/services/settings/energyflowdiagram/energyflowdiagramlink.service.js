'use strict';
app.factory('EnergyFlowDiagramLinkService', function($http) {
    return {

        getLinksByEnergyFlowDiagramID: function(id, callback) {
            $http.get(getAPI()+'energyflowdiagrams/'+id+'/links')
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        addEnergyFlowDiagramLink: function(energyflowdiagramID, energyflowdiagramlink, callback) {
            $http.post(getAPI()+'energyflowdiagrams/'+energyflowdiagramID+'/links',{data:energyflowdiagramlink})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        editEnergyFlowDiagramLink: function(energyflowdiagramID,energyflowdiagramlink,callback) {
            $http.put(getAPI()+'energyflowdiagrams/'+energyflowdiagramID+'/links/'+energyflowdiagramlink.id,{data:energyflowdiagramlink})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        deleteEnergyFlowDiagramLink: function(energyflowdiagramID, linkID, callback) {
            $http.delete(getAPI()+'energyflowdiagrams/'+energyflowdiagramID+'/links/'+linkID)
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
    };
});
