'use strict';
app.factory('CombinedEquipmentDataSourceService', function($http) {
    return {
        addPair: function(combinedEquipmentID, dataSourceID, headers, callback) {
            $http.post(getAPI()+'combinedequipments/'+combinedEquipmentID+'/datasources',{data:{'data_source_id':dataSourceID}}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        deletePair: function(combinedEquipmentID, dataSourceID, headers, callback) {
            $http.delete(getAPI()+'combinedequipments/'+combinedEquipmentID+'/datasources/'+dataSourceID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getDataSourcesByCombinedEquipmentID: function(id, headers, callback) {
            $http.get(getAPI()+'combinedequipments/'+id+'/datasources', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
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

