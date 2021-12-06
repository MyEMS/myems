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
        addCombinedEquipmentParameter: function(combinedequipmentID, combinedequipmentparameter, headers, callback) {
            $http.post(getAPI()+'combinedequipments/'+combinedequipmentID+'/parameters',{data:combinedequipmentparameter}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        editCombinedEquipmentParameter: function(combinedequipmentID,combinedequipmentparameter, headers, callback) {
            $http.put(getAPI()+'combinedequipments/'+combinedequipmentID+'/parameters/'+combinedequipmentparameter.id,
                      {data:combinedequipmentparameter}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

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
