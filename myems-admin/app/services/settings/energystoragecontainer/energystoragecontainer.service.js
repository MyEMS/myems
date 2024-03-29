'use strict';
app.factory('EnergyStorageContainerService', function($http) {
    return {
        getAllEnergyStorageContainers:function(headers, callback){
            $http.get(getAPI()+'energystoragecontainers', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        searchEnergyStorageContainers: function(query, headers, callback) {
            $http.get(getAPI()+'energystoragecontainers', { params: { q: query } }, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        addEnergyStorageContainer: function(energystoragecontainer, headers, callback) {
            $http.post(getAPI()+'energystoragecontainers',{data:energystoragecontainer}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        editEnergyStorageContainer: function(energystoragecontainer, headers, callback) {
            $http.put(getAPI()+'energystoragecontainers/'+energystoragecontainer.id,{data:energystoragecontainer}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        deleteEnergyStorageContainer: function(energystoragecontainer, headers, callback) {
            $http.delete(getAPI()+'energystoragecontainers/'+energystoragecontainer.id, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
    };
});
