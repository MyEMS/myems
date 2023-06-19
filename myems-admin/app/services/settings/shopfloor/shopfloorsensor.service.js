'use strict';
app.factory('ShopfloorSensorService', function($http) {
    return {
        addPair: function(shopfloorID,sensorID, headers, callback) {
            $http.post(getAPI()+'shopfloors/'+shopfloorID+'/sensors',{data:{'sensor_id':sensorID}}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        deletePair: function(shopfloorID,sensorID, headers, callback) {
            $http.delete(getAPI()+'shopfloors/'+shopfloorID+'/sensors/'+sensorID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getSensorsByShopfloorID: function(id, headers, callback) {
            $http.get(getAPI()+'shopfloors/'+id+'/sensors', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});
