'use strict';
app.factory('StoreSensorService', function($http) {
    return {
        addPair: function(storeID,sensorID,callback) {
            $http.post(getAPI()+'stores/'+storeID+'/sensors',{data:{'sensor_id':sensorID}})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        deletePair: function(storeID,sensorID, callback) {
            $http.delete(getAPI()+'stores/'+storeID+'/sensors/'+sensorID)
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getSensorsByStoreID: function(id, callback) {
            $http.get(getAPI()+'stores/'+id+'/sensors')
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});
