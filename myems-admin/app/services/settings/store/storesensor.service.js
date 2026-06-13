'use strict';

// Store Sensor service - REST API wrapper
app.factory('StoreSensorService', function($http) {
    return {
        // POST create pair
        addPair: function(storeID,sensorID, headers, callback) {
            $http.post(getAPI()+'stores/'+storeID+'/sensors',{data:{'sensor_id':sensorID}}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        // DELETE pair
        deletePair: function(storeID,sensorID, headers, callback) {
            $http.delete(getAPI()+'stores/'+storeID+'/sensors/'+sensorID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // GET sensors by store id by ID
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
