'use strict';
app.factory('ShopfloorSensorService', function($http) {
    return {
        addPair: function(shopfloorID,sensorID,callback) {
            $http.post(getAPI()+'shopfloors/'+shopfloorID+'/sensors',{data:{'sensor_id':sensorID}})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        deletePair: function(shopfloorID,sensorID, callback) {
            $http.delete(getAPI()+'shopfloors/'+shopfloorID+'/sensors/'+sensorID)
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getSensorsByShopfloorID: function(id, callback) {
            $http.get(getAPI()+'shopfloors/'+id+'/sensors')
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});
