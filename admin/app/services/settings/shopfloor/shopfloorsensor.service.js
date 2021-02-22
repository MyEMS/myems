'use strict';
app.factory('ShopfloorSensorService', function($http) {
    return {
        addPair: function(shopfloorID,sensorID,callback) {
            $http.post(getAPI()+'shopfloors/'+shopfloorID+'/sensors',{data:{'sensor_id':sensorID}})
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e) {
                    callback(e);
                });
        },

        deletePair: function(shopfloorID,sensorID, callback) {
            $http.delete(getAPI()+'shopfloors/'+shopfloorID+'/sensors/'+sensorID)
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e) {
                    callback(e);
                });
        },
        getSensorsByShopfloorID: function(id, callback) {
            $http.get(getAPI()+'shopfloors/'+id+'/sensors')
                .success(function (response, status, headers, config) {
                    callback(null, response);
                })
                .error(function (e) {
                    callback(e);
                });
        }
    };
});
