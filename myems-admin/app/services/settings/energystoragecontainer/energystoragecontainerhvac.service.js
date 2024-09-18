'use strict';
app.factory('EnergyStorageContainerHVACService', function($http) {
    return {
        getAllEnergyStorageContainerHVACs: function(headers, callback) {
            $http.get(getAPI()+'energystoragecontainerhvacs', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getEnergyStorageContainerHVACsByEnergyStorageContainerID: function(id, headers, callback) {
            $http.get(getAPI()+'energystoragecontainers/'+id+'/hvacs', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        addEnergyStorageContainerHVAC: function(id, energystoragecontainerhvac, headers, callback) {
            $http.post(getAPI()+'energystoragecontainers/'+id+'/hvacs',{data:energystoragecontainerhvac}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        editEnergyStorageContainerHVAC: function(id, energystoragecontainerhvac, headers, callback) {
            $http.put(getAPI()+'energystoragecontainers/'+id+'/hvacs/'+energystoragecontainerhvac.id,{data:energystoragecontainerhvac}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        deleteEnergyStorageContainerHVAC: function(id, energystoragecontainerhvacID, headers, callback) {
            $http.delete(getAPI()+'energystoragecontainers/'+id+'/hvacs/'+energystoragecontainerhvacID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
    };
});
