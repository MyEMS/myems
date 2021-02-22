'use strict';
app.factory('CombinedEquipmentMeterService', function ($http) {
    return {
        addPair: function (combinedequipmentID, meterID, metertype, is_output, callback) {
            var meter = {};
            if (metertype == 'meters') {
                meter = { 'meter_id': meterID, is_output: is_output };
            } else if (metertype == 'virtualmeters') {
                meter = { "virtual_meter_id": meterID, is_output: is_output };
            } else {
                meter = { 'offline_meter_id': meterID, is_output: is_output };
            }
            $http.post(getAPI() + 'combinedequipments/' + combinedequipmentID + '/' + metertype, { data: meter })
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e) {
                    callback(e);
                });
        },

        deletePair: function (combinedequipmentID, meterID, metertype, callback) {
            $http.delete(getAPI() + 'combinedequipments/' + combinedequipmentID + '/' + metertype + '/' + meterID)
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e) {
                    callback(e);
                });
        },
        getMetersByCombinedEquipmentID: function (id, metertype, callback) {
            $http.get(getAPI() + 'combinedequipments/' + id + '/' + metertype)
                .success(function (response, status, headers, config) {
                    callback(null, response);
                })
                .error(function (e) {
                    callback(e);
                });
        }
    };
});  