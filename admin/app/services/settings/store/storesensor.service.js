'use strict';
app.factory('StoreSensorService', function($http) {
    return {
        addPair: function(storeID,sensorID,callback) {
            $http.post(getAPI()+'stores/'+storeID+'/sensors',{data:{'sensor_id':sensorID}})
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e) {
                    callback(e);
                });
        },

        deletePair: function(storeID,sensorID, callback) {
            $http.delete(getAPI()+'stores/'+storeID+'/sensors/'+sensorID)
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e) {
                    callback(e);
                });
        },
        getSensorsByStoreID: function(id, callback) {
            $http.get(getAPI()+'stores/'+id+'/sensors')
                .success(function (response, status, headers, config) {
                    callback(null, response);
                })
                .error(function (e) {
                    callback(e);
                });
        }
    };
});
