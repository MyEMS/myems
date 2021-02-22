'use strict';
app.factory('EquipmentParameterService', function($http) {
    return {

        getParametersByEquipmentID: function(id, callback) {
            $http.get(getAPI()+'equipments/'+id+'/parameters')
                .success(function (response, status, headers, config) {
                    callback(null, response);
                })
                .error(function (e) {
                    callback(e);
                });
        },
        addEquipmentParameter: function(equipmentID, equipmentparameter,callback) {
            $http.post(getAPI()+'equipments/'+equipmentID+'/parameters',{data:equipmentparameter})
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e) {
                    callback(e);
                });
        },
        editEquipmentParameter: function(equipmentID,equipmentparameter,callback) {
            $http.put(getAPI()+'equipments/'+equipmentID+'/parameters/'+equipmentparameter.id,{data:equipmentparameter})
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e) {
                    callback(e);
                });
        },

        deleteEquipmentParameter: function(equipmentID, parameterID, callback) {
            $http.delete(getAPI()+'equipments/'+equipmentID+'/parameters/'+parameterID)
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e) {
                    callback(e);
                });
        },
    };
});
