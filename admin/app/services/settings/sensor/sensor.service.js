'use strict';
app.factory('SensorService', function($http) {
    return {
        getAllSensors:function(callback){
            $http.get(getAPI()+'sensors')
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        searchSensors: function(query, callback) {
            $http.get(getAPI()+'sensors', { params: { q: query } })
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        addSensor: function(sensor, callback) {
            $http.post(getAPI()+'sensors',{data:sensor})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        editSensor: function(sensor, callback) {
            $http.put(getAPI()+'sensors/'+sensor.id,{data:sensor})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        deleteSensor: function(sensor, callback) {
            $http.delete(getAPI()+'sensors/'+sensor.id)
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getSensor: function(id, callback) {
            $http.get(getAPI()+'sensors/'+id)
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});
