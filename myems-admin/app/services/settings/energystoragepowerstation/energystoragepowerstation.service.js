'use strict';
app.factory('EnergyStoragePowerStationService', function($http) {
    return {
        getAllEnergyStoragePowerStations:function(headers, callback){
            $http.get(getAPI()+'energystoragepowerstations', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        searchEnergyStoragePowerStations: function(query, headers, callback) {
            $http.get(getAPI()+'energystoragepowerstations', { params: { q: query } }, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        addEnergyStoragePowerStation: function(energystoragepowerstation, headers, callback) {
            $http.post(getAPI()+'energystoragepowerstations',{data:energystoragepowerstation}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        editEnergyStoragePowerStation: function(energystoragepowerstation, headers, callback) {
            $http.put(getAPI()+'energystoragepowerstations/'+energystoragepowerstation.id,{data:energystoragepowerstation}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        deleteEnergyStoragePowerStation: function(energystoragepowerstation, headers, callback) {
            $http.delete(getAPI()+'energystoragepowerstations/'+energystoragepowerstation.id, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
    };
});
