'use strict';
app.factory('EnergyFlowDiagramLinkService', function($http) {
    return {

        getLinksByEnergyFlowDiagramID: function(id, callback) {
            $http.get(getAPI()+'energyflowdiagrams/'+id+'/links')
                .success(function (response, status, headers, config) {
                    callback(null, response);
                })
                .error(function (e) {
                    callback(e);
                });
        },
        addEnergyFlowDiagramLink: function(energyflowdiagramID, energyflowdiagramlink, callback) {
            $http.post(getAPI()+'energyflowdiagrams/'+energyflowdiagramID+'/links',{data:energyflowdiagramlink})
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e) {
                    callback(e);
                });
        },
        editEnergyFlowDiagramLink: function(energyflowdiagramID,energyflowdiagramlink,callback) {
            $http.put(getAPI()+'energyflowdiagrams/'+energyflowdiagramID+'/links/'+energyflowdiagramlink.id,{data:energyflowdiagramlink})
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e) {
                    callback(e);
                });
        },

        deleteEnergyFlowDiagramLink: function(energyflowdiagramID, linkID, callback) {
            $http.delete(getAPI()+'energyflowdiagrams/'+energyflowdiagramID+'/links/'+linkID)
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e) {
                    callback(e);
                });
        },
    };
});
