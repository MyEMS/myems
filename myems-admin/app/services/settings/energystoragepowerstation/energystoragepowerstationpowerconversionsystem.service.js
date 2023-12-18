'use strict';
app.factory('EnergyStoragePowerStationPowerconversionsystemService', function($http) {
    return {
        getAllEnergyStoragePowerStationPowerconversionsystems: function(headers, callback) {
            $http.get(getAPI()+'energystoragepowerstationpowerconversionsystems', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getEnergyStoragePowerStationPowerconversionsystemsByEnergyStoragePowerStationID: function(id, headers, callback) {
            $http.get(getAPI()+'energystoragepowerstations/'+id+'/powerconversionsystems', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        addEnergyStoragePowerStationPowerconversionsystem: function(id, energystoragepowerstationpowerconversionsystem, headers, callback) {
            $http.post(getAPI()+'energystoragepowerstations/'+id+'/powerconversionsystems',{data:energystoragepowerstationpowerconversionsystem}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        editEnergyStoragePowerStationPowerconversionsystem: function(id, energystoragepowerstationpowerconversionsystem, headers, callback) {
            $http.put(getAPI()+'energystoragepowerstations/'+id+'/powerconversionsystems/'+energystoragepowerstationpowerconversionsystem.id,{data:energystoragepowerstationpowerconversionsystem}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        deleteEnergyStoragePowerStationPowerconversionsystem: function(id, energystoragepowerstationpowerconversionsystemyID, headers, callback) {
            $http.delete(getAPI()+'energystoragepowerstations/'+id+'/powerconversionsystems/'+energystoragepowerstationpowerconversionsystemyID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
    };
});
