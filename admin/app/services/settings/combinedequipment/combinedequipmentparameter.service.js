'use strict';
app.factory('CombinedEquipmentParameterService', function($http) {
    return {

        getParametersByCombinedEquipmentID: function(id, callback) {
            $http.get(getAPI()+'combinedequipments/'+id+'/parameters')
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        addCombinedEquipmentParameter: function(combinedequipmentID, combinedequipmentparameter,callback) {
            $http.post(getAPI()+'combinedequipments/'+combinedequipmentID+'/parameters',{data:combinedequipmentparameter})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        editCombinedEquipmentParameter: function(combinedequipmentID,combinedequipmentparameter,callback) {
            $http.put(getAPI()+'combinedequipments/'+combinedequipmentID+'/parameters/'+combinedequipmentparameter.id,{data:combinedequipmentparameter})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        deleteCombinedEquipmentParameter: function(combinedequipmentID, parameterID, callback) {
            $http.delete(getAPI()+'combinedequipments/'+combinedequipmentID+'/parameters/'+parameterID)
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
    };
});
