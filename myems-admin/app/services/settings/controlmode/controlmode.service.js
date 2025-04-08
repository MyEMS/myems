'use strict';
app.factory('ControlModeService', function($http) {
    return {
        getAllControlModes:function(headers, callback){
            $http.get(getAPI()+'controlmodes', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        searchControlModes: function(query, headers, callback) {
            $http.get(getAPI()+'controlmodes', { params: { q: query } }, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        addControlMode: function(controlmode, headers, callback) {
            $http.post(getAPI()+'controlmodes',{data:controlmode}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        editControlMode: function(controlmode, headers, callback) {
            $http.put(getAPI()+'controlmodes/'+controlmode.id,{data:controlmode}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        deleteControlMode: function(controlmode, headers, callback) {
            $http.delete(getAPI()+'controlmodes/'+controlmode.id, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        exportControlMode: function(controlmode, headers, callback) {
            $http.get(getAPI()+'controlmodes/'+controlmode.id+'/export', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        importControlMode: function(importdata, headers, callback) {
            $http.post(getAPI()+'controlmodes/import', JSON.parse(importdata), {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
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