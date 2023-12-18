'use strict';
app.factory('EnergyStoragePowerStationLoadService', function($http) {
    return {
        getAllEnergyStoragePowerStationLoads: function(headers, callback) {
            $http.get(getAPI()+'energystoragepowerstationloads', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getEnergyStoragePowerStationLoadsByEnergyStoragePowerStationID: function(id, headers, callback) {
            $http.get(getAPI()+'energystoragepowerstations/'+id+'/loads', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        addEnergyStoragePowerStationLoad: function(id, energystoragepowerstationload, headers, callback) {
            $http.post(getAPI()+'energystoragepowerstations/'+id+'/loads',{data:energystoragepowerstationload}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        editEnergyStoragePowerStationLoad: function(id, energystoragepowerstationload, headers, callback) {
            $http.put(getAPI()+'energystoragepowerstations/'+id+'/loads/'+energystoragepowerstationload.id,{data:energystoragepowerstationload}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        deleteEnergyStoragePowerStationLoad: function(id, energystoragepowerstationloadyID, headers, callback) {
            $http.delete(getAPI()+'energystoragepowerstations/'+id+'/loads/'+energystoragepowerstationloadyID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
    };
});
