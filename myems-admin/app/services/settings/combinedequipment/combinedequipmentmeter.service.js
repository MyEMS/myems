'use strict';

// Combined Equipment Meter service - REST API wrapper
app.factory('CombinedEquipmentMeterService', function ($http) {
    return {
        // POST create pair
        addPair: function (combinedequipmentID, meterID, metertype, is_output, headers, callback) {
            var meter = {};
            if (metertype == 'meters') {
                meter = { 'meter_id': meterID, is_output: is_output };
            } else if (metertype == 'virtualmeters') {
                meter = { "virtual_meter_id": meterID, is_output: is_output };
            } else {
                meter = { 'offline_meter_id': meterID, is_output: is_output };
            }
            $http.post(getAPI() + 'combinedequipments/' + combinedequipmentID + '/' + metertype, { data: meter }, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        // DELETE pair
        deletePair: function (combinedequipmentID, meterID, metertype, headers, callback) {
            $http.delete(getAPI() + 'combinedequipments/' + combinedequipmentID + '/' + metertype + '/' + meterID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // GET meters by combined equipment id by ID
        getMetersByCombinedEquipmentID: function (id, metertype, headers, callback) {
            $http.get(getAPI() + 'combinedequipments/' + id + '/' + metertype, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        
        // GET combined equipments that a meter is bound to (RESTful style)
        checkMeterBinding: function(meterId, meterType, headers, callback) {
            $http.get(getAPI()+'meters/'+meterId+'/combinedequipments', {
                params: {
                    type: meterType
                },
                headers: headers
            })
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});  