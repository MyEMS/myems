'use strict';
app.factory('EquipmentParameterService', function($http) {
    return {

        getParametersByEquipmentID: function(id, callback) {
            $http.get(getAPI()+'equipments/'+id+'/parameters')
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        addEquipmentParameter: function(equipmentID, equipmentparameter,callback) {
            $http.post(getAPI()+'equipments/'+equipmentID+'/parameters',{data:equipmentparameter})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        editEquipmentParameter: function(equipmentID,equipmentparameter,callback) {
            $http.put(getAPI()+'equipments/'+equipmentID+'/parameters/'+equipmentparameter.id,{data:equipmentparameter})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        deleteEquipmentParameter: function(equipmentID, parameterID, callback) {
            $http.delete(getAPI()+'equipments/'+equipmentID+'/parameters/'+parameterID)
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
    };
});
