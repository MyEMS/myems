'use strict';

// Equipment Data Source service - REST API wrapper
app.factory('EquipmentDataSourceService', function($http) {
    return {
        // POST create pair
        addPair: function(equipmentID, dataSourceID, headers, callback) {
            $http.post(getAPI()+'equipments/'+equipmentID+'/datasources',{data:{'data_source_id':dataSourceID}}, {headers: headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        // DELETE pair
        deletePair: function(equipmentID, dataSourceID, headers, callback) {
            $http.delete(getAPI()+'equipments/'+equipmentID+'/datasources/'+dataSourceID, {headers: headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // GET data sources by equipment id by ID
        getDataSourcesByEquipmentID: function(id, headers, callback) {
            $http.get(getAPI()+'equipments/'+id+'/datasources', {headers: headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // GET data source points by equipment id by ID
        getDataSourcePointsByEquipmentID: function(id, headers, callback) {
            $http.get(getAPI()+'equipments/'+id+'/datasourcepoints', {headers: headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // GET add points by ID
        getAddPoints:function(id, headers, callback){
            $http.get(getAPI() + 'equipments/'+id+'/addpoints', {headers: headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // GET edit points by ID
        getEditPoints:function(id, pid, headers, callback){
            $http.get(getAPI() + 'equipments/'+id+'/editpoints/'+pid, {headers: headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});
