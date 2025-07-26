'use strict';
app.factory('EnergyStorageContainerDataSourceService', function($http) {
    return {
        addPair: function(energystoragecontainerID,dataSourceID, headers, callback) {
            $http.post(getAPI()+'energystoragecontainers/'+energystoragecontainerID+'/datasources',{data:{'data_source_id':dataSourceID}}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        deletePair: function(energystoragecontainerID, dataSourceID, headers, callback) {
            $http.delete(getAPI()+'energystoragecontainers/'+energystoragecontainerID+'/datasources/'+dataSourceID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getDataSourcesByEnergyStorageContainerID: function(id, headers, callback) {
            $http.get(getAPI()+'energystoragecontainers/'+id+'/datasources', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getDataSourcePointsByEnergyStorageContainerID: function(id, headers, callback) {
            $http.get(getAPI()+'energystoragecontainers/'+id+'/datasourcepoints', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});