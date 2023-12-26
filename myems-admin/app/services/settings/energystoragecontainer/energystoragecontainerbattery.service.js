'use strict';
app.factory('EnergyStorageContainerBatteryService', function($http) {
    return {
        getAllEnergyStorageContainerBatteries: function(headers, callback) {
            $http.get(getAPI()+'energystoragecontainerbatteries', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getEnergyStorageContainerBatteriesByEnergyStorageContainerID: function(id, headers, callback) {
            $http.get(getAPI()+'energystoragecontainers/'+id+'/batteries', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        addEnergyStorageContainerBattery: function(id, energystoragecontainerbattery, headers, callback) {
            $http.post(getAPI()+'energystoragecontainers/'+id+'/batteries',{data:energystoragecontainerbattery}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        editEnergyStorageContainerBattery: function(id, energystoragecontainerbattery, headers, callback) {
            $http.put(getAPI()+'energystoragecontainers/'+id+'/batteries/'+energystoragecontainerbattery.id,{data:energystoragecontainerbattery}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        deleteEnergyStorageContainerBattery: function(id, energystoragecontainerbatteryID, headers, callback) {
            $http.delete(getAPI()+'energystoragecontainers/'+id+'/batteries/'+energystoragecontainerbatteryID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
    };
});
