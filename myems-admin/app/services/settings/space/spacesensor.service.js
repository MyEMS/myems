'use strict';

// Space Sensor service - REST API wrapper
app.factory('SpaceSensorService', function($http) {
    return {
        // POST create pair
        addPair: function(spaceID,sensorID, headers, callback) {
            $http.post(getAPI()+'spaces/'+spaceID+'/sensors',{data:{'sensor_id':sensorID}}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        // DELETE pair
        deletePair: function(spaceID,sensorID, headers, callback) {
            $http.delete(getAPI()+'spaces/'+spaceID+'/sensors/'+sensorID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // GET sensors by space id by ID
        getSensorsBySpaceID: function(id, headers, callback) {
            $http.get(getAPI()+'spaces/'+id+'/sensors', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});
