'use strict';
app.factory('CombinedEquipmentParameterService', function($http) {
    return {

        getParametersByCombinedEquipmentID: function(id, callback) {
            $http.get(getAPI()+'combinedequipments/'+id+'/parameters')
                .success(function (response, status, headers, config) {
                    callback(null, response);
                })
                .error(function (e) {
                    callback(e);
                });
        },
        addCombinedEquipmentParameter: function(combinedequipmentID, combinedequipmentparameter,callback) {
            $http.post(getAPI()+'combinedequipments/'+combinedequipmentID+'/parameters',{data:combinedequipmentparameter})
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e) {
                    callback(e);
                });
        },
        editCombinedEquipmentParameter: function(combinedequipmentID,combinedequipmentparameter,callback) {
            $http.put(getAPI()+'combinedequipments/'+combinedequipmentID+'/parameters/'+combinedequipmentparameter.id,{data:combinedequipmentparameter})
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e) {
                    callback(e);
                });
        },

        deleteCombinedEquipmentParameter: function(combinedequipmentID, parameterID, callback) {
            $http.delete(getAPI()+'combinedequipments/'+combinedequipmentID+'/parameters/'+parameterID)
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e) {
                    callback(e);
                });
        },
    };
});
