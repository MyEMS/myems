'use strict';
app.factory('EnergyStoragePowerStationGridService', function($http) {
    return {
        getAllEnergyStoragePowerStationGrids: function(headers, callback) {
            $http.get(getAPI()+'energystoragepowerstationgrids', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getEnergyStoragePowerStationGridsByEnergyStoragePowerStationID: function(id, headers, callback) {
            $http.get(getAPI()+'energystoragepowerstations/'+id+'/grids', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        addEnergyStoragePowerStationGrid: function(id, energystoragepowerstationgrid, headers, callback) {
            $http.post(getAPI()+'energystoragepowerstations/'+id+'/grids',{data:energystoragepowerstationgrid}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        editEnergyStoragePowerStationGrid: function(id, energystoragepowerstationgrid, headers, callback) {
            $http.put(getAPI()+'energystoragepowerstations/'+id+'/grids/'+energystoragepowerstationgrid.id,{data:energystoragepowerstationgrid}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        deleteEnergyStoragePowerStationGrid: function(id, energystoragepowerstationgridyID, headers, callback) {
            $http.delete(getAPI()+'energystoragepowerstations/'+id+'/grids/'+energystoragepowerstationgridyID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
    };
});
