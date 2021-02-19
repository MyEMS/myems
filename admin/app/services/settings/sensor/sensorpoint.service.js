'use strict';
app.factory('SensorPointService', function($http) {
    return {
        addPair: function(sensorID,pointID,callback) {
            $http.post(getAPI()+'sensors/'+sensorID+'/points',{data:{'point_id':pointID}})
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e) {
                    callback(e);
                });
        },

        deletePair: function(sensorID,pointID, callback) {
            $http.delete(getAPI()+'sensors/'+sensorID+'/points/'+pointID)
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e) {
                    callback(e);
                });
        },
        getPointsBySensorID: function(id, callback) {
            $http.get(getAPI()+'sensors/'+id+'/points')
                .success(function (response, status, headers, config) {
                    callback(null, response);
                })
                .error(function (e) {
                    callback(e);
                });
        }
    };
});
