'use strict';
app.factory('EquipmentDataSourceService', function($http) {
    return {
        addPair: function(equipmentID, dataSourceID, headers, callback) {
            $http.post(getAPI()+'equipments/'+equipmentID+'/datasources',{data:{'data_source_id':dataSourceID}}, {headers: headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        deletePair: function(equipmentID, dataSourceID, headers, callback) {
            $http.delete(getAPI()+'equipments/'+equipmentID+'/datasources/'+dataSourceID, {headers: headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getDataSourcesByEquipmentID: function(id, headers, callback) {
            $http.get(getAPI()+'equipments/'+id+'/datasources', {headers: headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getDataSourcePointsByEquipmentID: function(id, headers, callback) {
            $http.get(getAPI()+'equipments/'+id+'/datasourcepoints', {headers: headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getAddPoints:function(id, headers, callback){
            $http.get(getAPI() + 'equipments/'+id+'/addpoints', {headers: headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
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
