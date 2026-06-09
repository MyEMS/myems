'use strict';

// Equipment Parameter service - REST API wrapper
app.factory('EquipmentParameterService', function($http) {
    return {

        // GET parameters by equipment id by ID
        getParametersByEquipmentID: function(id, headers, callback) {
            $http.get(getAPI()+'equipments/'+id+'/parameters', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // POST create equipment parameter
        addEquipmentParameter: function(equipmentID, equipmentparameter, headers, callback) {
            $http.post(getAPI()+'equipments/'+equipmentID+'/parameters',{data:equipmentparameter}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // PUT update equipment parameter
        editEquipmentParameter: function(equipmentID, equipmentparameter, headers, callback) {
            $http.put(getAPI()+'equipments/'+equipmentID+'/parameters/'+equipmentparameter.id,{data:equipmentparameter}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // DELETE equipment parameter
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
