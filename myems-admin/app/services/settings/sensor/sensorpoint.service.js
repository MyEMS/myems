'use strict';

// Sensor Point service - REST API wrapper
app.factory('SensorPointService', function($http) {
    return {
        // POST create pair
        addPair: function(sensorID,pointID, headers, callback) {
            $http.post(getAPI()+'sensors/'+sensorID+'/points',{data:{'point_id':pointID}}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        // DELETE pair
        deletePair: function(sensorID,pointID, headers, callback) {
            $http.delete(getAPI()+'sensors/'+sensorID+'/points/'+pointID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // GET points by sensor id by ID
        getPointsBySensorID: function(id, headers, callback) {
            $http.get(getAPI()+'sensors/'+id+'/points', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});
