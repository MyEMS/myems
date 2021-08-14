'use strict';
app.factory('SensorPointService', function($http) {
    return {
        addPair: function(sensorID,pointID,callback) {
            $http.post(getAPI()+'sensors/'+sensorID+'/points',{data:{'point_id':pointID}})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        deletePair: function(sensorID,pointID, callback) {
            $http.delete(getAPI()+'sensors/'+sensorID+'/points/'+pointID)
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getPointsBySensorID: function(id, callback) {
            $http.get(getAPI()+'sensors/'+id+'/points')
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});
