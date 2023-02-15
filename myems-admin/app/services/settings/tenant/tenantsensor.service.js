'use strict';
app.factory('TenantSensorService', function($http) {
    return {
        addPair: function(tenantID,sensorID, headers, callback) {
            $http.post(getAPI()+'tenants/'+tenantID+'/sensors',{data:{'sensor_id':sensorID}}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        deletePair: function(tenantID,sensorID, headers, callback) {
            $http.delete(getAPI()+'tenants/'+tenantID+'/sensors/'+sensorID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getSensorsByTenantID: function(id, callback) {
            $http.get(getAPI()+'tenants/'+id+'/sensors')
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});
