'use strict';

// Combined Equipment Parameter service - REST API wrapper
app.factory('CombinedEquipmentParameterService', function($http) {
    return {
        // GET parameters by combined equipment id by ID
        getParametersByCombinedEquipmentID: function(id, headers, callback) {
            $http.get(getAPI()+'combinedequipments/'+id+'/parameters', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // POST create combined equipment parameter
        addCombinedEquipmentParameter: function(combinedequipmentID, combinedequipmentparameter, headers, callback) {
            $http.post(getAPI()+'combinedequipments/'+combinedequipmentID+'/parameters',{data:combinedequipmentparameter}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // PUT update combined equipment parameter
        editCombinedEquipmentParameter: function(combinedequipmentID,combinedequipmentparameter, headers, callback) {
            $http.put(getAPI()+'combinedequipments/'+combinedequipmentID+'/parameters/'+combinedequipmentparameter.id,
                      {data:combinedequipmentparameter}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        // DELETE combined equipment parameter
        deleteCombinedEquipmentParameter: function(combinedequipmentID, parameterID, headers, callback) {
            $http.delete(getAPI()+'combinedequipments/'+combinedequipmentID+'/parameters/'+parameterID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
    };
});
