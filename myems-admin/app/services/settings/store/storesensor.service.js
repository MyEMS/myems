'use strict';
app.factory('StoreSensorService', function($http) {
    return {
        addPair: function(storeID,sensorID, headers, callback) {
            $http.post(getAPI()+'stores/'+storeID+'/sensors',{data:{'sensor_id':sensorID}}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        deletePair: function(storeID,sensorID, headers, callback) {
            $http.delete(getAPI()+'stores/'+storeID+'/sensors/'+sensorID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getSensorsByStoreID: function(id, headers, callback) {
            $http.get(getAPI()+'stores/'+id+'/sensors', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});
