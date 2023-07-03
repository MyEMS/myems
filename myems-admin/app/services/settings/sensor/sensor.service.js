'use strict';
app.factory('SensorService', function($http) {
    return {
        getAllSensors:function(headers, callback){
            $http.get(getAPI()+'sensors', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        searchSensors: function(query, headers, callback) {
            $http.get(getAPI()+'sensors', { params: { q: query } }, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        addSensor: function(sensor, headers, callback) {
            $http.post(getAPI()+'sensors',{data:sensor}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        editSensor: function(sensor, headers, callback) {
            $http.put(getAPI()+'sensors/'+sensor.id,{data:sensor}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        deleteSensor: function(sensor, headers, callback) {
            $http.delete(getAPI()+'sensors/'+sensor.id, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});
