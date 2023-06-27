'use strict';
app.factory('EquipmentParameterService', function($http) {
    return {

        getParametersByEquipmentID: function(id, headers, callback) {
            $http.get(getAPI()+'equipments/'+id+'/parameters', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        addEquipmentParameter: function(equipmentID, equipmentparameter, headers, callback) {
            $http.post(getAPI()+'equipments/'+equipmentID+'/parameters',{data:equipmentparameter}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        editEquipmentParameter: function(equipmentID, equipmentparameter, headers, callback) {
            $http.put(getAPI()+'equipments/'+equipmentID+'/parameters/'+equipmentparameter.id,{data:equipmentparameter}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        deleteEquipmentParameter: function(equipmentID, parameterID, headers, callback) {
            $http.delete(getAPI()+'equipments/'+equipmentID+'/parameters/'+parameterID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
    };
});
