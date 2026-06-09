'use strict';

// Combined Equipment Data Source service - REST API wrapper
app.factory('CombinedEquipmentDataSourceService', function($http) {
    return {
        // POST create pair
        addPair: function(combinedEquipmentID, dataSourceID, headers, callback) {
            $http.post(getAPI()+'combinedequipments/'+combinedEquipmentID+'/datasources',{data:{'data_source_id':dataSourceID}}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        // DELETE pair
        deletePair: function(combinedEquipmentID, dataSourceID, headers, callback) {
            $http.delete(getAPI()+'combinedequipments/'+combinedEquipmentID+'/datasources/'+dataSourceID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // GET data sources by combined equipment id by ID
        getDataSourcesByCombinedEquipmentID: function(id, headers, callback) {
            $http.get(getAPI()+'combinedequipments/'+id+'/datasources', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // GET data source points by combined equipment id by ID
        getDataSourcePointsByCombinedEquipmentID: function(id, headers, callback) {
            $http.get(getAPI()+'combinedequipments/'+id+'/datasourcepoints', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});

