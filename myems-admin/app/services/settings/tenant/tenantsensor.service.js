'use strict';

// Tenant Sensor service - REST API wrapper
app.factory('TenantSensorService', function($http) {
    return {
        // POST create pair
        addPair: function(tenantID,sensorID, headers, callback) {
            $http.post(getAPI()+'tenants/'+tenantID+'/sensors',{data:{'sensor_id':sensorID}}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        // DELETE pair
        deletePair: function(tenantID,sensorID, headers, callback) {
            $http.delete(getAPI()+'tenants/'+tenantID+'/sensors/'+sensorID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // GET sensors by tenant id by ID
        getSensorsByTenantID: function(id, headers, callback) {
            $http.get(getAPI()+'tenants/'+id+'/sensors', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});
