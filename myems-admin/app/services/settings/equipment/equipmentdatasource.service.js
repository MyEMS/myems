'use strict';
app.factory('EquipmentDataSourceService', function($http) {
    return {
        addPair: function(equipmentID, dataSourceID, headers, callback) {
            $http.post(getAPI()+'equipments/'+equipmentID+'/datasources',{data:{'data_source_id':dataSourceID}}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        deletePair: function(equipmentID, dataSourceID, headers, callback) {
            $http.delete(getAPI()+'equipments/'+equipmentID+'/datasources/'+dataSourceID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getDataSourcesByEquipmentID: function(id, headers, callback) {
            $http.get(getAPI()+'equipments/'+id+'/datasources', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getDataSourcePointsByEquipmentID: function(id, headers, callback) {
            $http.get(getAPI()+'equipments/'+id+'/datasourcepoints', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});
