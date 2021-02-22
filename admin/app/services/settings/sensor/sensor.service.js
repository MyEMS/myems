'use strict';
app.factory('SensorService', function($http) {
    return {
        getAllSensors:function(callback){
            $http.get(getAPI()+'sensors')
                .success(function (response, status, headers, config) {
                    callback(null, response);
                })
                .error(function (e,status) {
                    callback(e,status);
                });
        },
        searchSensors: function(query, callback) {
            $http.get(getAPI()+'sensors', { params: { q: query } })
                .success(function (response, status, headers, config) {
                    callback(null, response);
                })
                .error(function (e,status) {
                    callback(e,status);
                });
        },
        addSensor: function(sensor, callback) {
            $http.post(getAPI()+'sensors',{data:sensor})
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e,status) {
                    callback(e,status);
                });
        },
        editSensor: function(sensor, callback) {
            $http.put(getAPI()+'sensors/'+sensor.id,{data:sensor})
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e,status) {
                    callback(e,status);
                });
        },
        deleteSensor: function(sensor, callback) {
            $http.delete(getAPI()+'sensors/'+sensor.id)
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e,status) {
                    callback(e,status);
                });
        },
        getSensor: function(id, callback) {
            $http.get(getAPI()+'sensors/'+id)
                .success(function (response, status, headers, config) {
                    callback(null, response);
                })
                .error(function (e,status) {
                    callback(e,status);
                });
        }
    };
});
