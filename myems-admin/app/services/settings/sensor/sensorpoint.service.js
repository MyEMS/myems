'use strict';
app.factory('SensorPointService', function($http) {
    return {
        addPair: function(sensorID,pointID, headers, callback) {
            $http.post(getAPI()+'sensors/'+sensorID+'/points',{data:{'point_id':pointID}}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        deletePair: function(sensorID,pointID, headers, callback) {
            $http.delete(getAPI()+'sensors/'+sensorID+'/points/'+pointID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
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
