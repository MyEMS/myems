'use strict';

// Control Mode service - REST API wrapper
app.factory('ControlModeService', function($http) {
    return {
        // GET all control modes
        getAllControlModes:function(headers, callback){
            $http.get(getAPI()+'controlmodes', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // Search control modes by query
        searchControlModes: function(query, headers, callback) {
            $http.get(getAPI()+'controlmodes', { params: { q: query } }, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // POST create control mode
        addControlMode: function(controlmode, headers, callback) {
            $http.post(getAPI()+'controlmodes',{data:controlmode}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // PUT update control mode
        editControlMode: function(controlmode, headers, callback) {
            $http.put(getAPI()+'controlmodes/'+controlmode.id,{data:controlmode}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // DELETE control mode
        deleteControlMode: function(controlmode, headers, callback) {
            $http.delete(getAPI()+'controlmodes/'+controlmode.id, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // GET export control mode
        exportControlMode: function(controlmode, headers, callback) {
            $http.get(getAPI()+'controlmodes/'+controlmode.id+'/export', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // POST import control mode
        importControlMode: function(importdata, headers, callback) {
            $http.post(getAPI()+'controlmodes/import', JSON.parse(importdata), {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // POST clone control mode
        cloneControlMode: function(controlmode, headers, callback) {
            $http.post(getAPI()+'controlmodes/'+controlmode.id+'/clone', {data:null}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
    };
});