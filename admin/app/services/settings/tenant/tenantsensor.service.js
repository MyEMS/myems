'use strict';
app.factory('TenantSensorService', function($http) {
    return {
        addPair: function(tenantID,sensorID,callback) {
            $http.post(getAPI()+'tenants/'+tenantID+'/sensors',{data:{'sensor_id':sensorID}})
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e) {
                    callback(e);
                });
        },

        deletePair: function(tenantID,sensorID, callback) {
            $http.delete(getAPI()+'tenants/'+tenantID+'/sensors/'+sensorID)
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e) {
                    callback(e);
                });
        },
        getSensorsByTenantID: function(id, callback) {
            $http.get(getAPI()+'tenants/'+id+'/sensors')
                .success(function (response, status, headers, config) {
                    callback(null, response);
                })
                .error(function (e) {
                    callback(e);
                });
        }
    };
});
