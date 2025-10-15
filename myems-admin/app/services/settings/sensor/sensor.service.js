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
        exportSensor: function(sensor, headers, callback) {
            $http.get(getAPI()+'sensors/'+sensor.id+'/export', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        importSensor: function(importdata, headers, callback) {
            $http.post(getAPI()+'sensors/import', JSON.parse(importdata), {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
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
