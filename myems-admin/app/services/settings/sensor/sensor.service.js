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
