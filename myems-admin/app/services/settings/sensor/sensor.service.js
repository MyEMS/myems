'use strict';

// Sensor service - REST API wrapper
app.factory('SensorService', function($http) {
    return {
        // GET all sensors
        getAllSensors:function(headers, callback){
            $http.get(getAPI()+'sensors', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // Search sensors by query
        searchSensors: function(query, headers, callback) {
            $http.get(getAPI()+'sensors', {
                params: {q: query},
                headers: headers
            })
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // POST create sensor
        addSensor: function(sensor, headers, callback) {
            $http.post(getAPI()+'sensors',{data:sensor}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // PUT update sensor
        editSensor: function(sensor, headers, callback) {
            $http.put(getAPI()+'sensors/'+sensor.id,{data:sensor}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // DELETE sensor
        deleteSensor: function(sensor, headers, callback) {
            $http.delete(getAPI()+'sensors/'+sensor.id, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // GET export sensor
        exportSensor: function(sensor, headers, callback) {
            $http.get(getAPI()+'sensors/'+sensor.id+'/export', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // POST import sensor
        importSensor: function(importdata, headers, callback) {
            $http.post(getAPI()+'sensors/import', JSON.parse(importdata), {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // POST clone sensor
        cloneSensor: function(sensor, headers, callback) {
            $http.post(getAPI()+'sensors/'+sensor.id+'/clone', {data:null}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});
