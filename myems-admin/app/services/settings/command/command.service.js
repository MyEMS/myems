'use strict';
app.factory('CommandService', function($http) {
    return {
        getAllCommands:function(headers, callback){
            $http.get(getAPI()+'commands', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        searchCommands: function(query, headers, callback) {
            $http.get(getAPI()+'commands', { params: { q: query } }, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        addCommand: function(command, headers, callback) {
            $http.post(getAPI()+'commands',{data:command}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        editCommand: function(command, headers, callback) {
            $http.put(getAPI()+'commands/'+command.id,{data:command}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        deleteCommand: function(command, headers, callback) {
            $http.delete(getAPI()+'commands/'+command.id, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        sendCommand: function(command, headers, callback) {
            $http.put(getAPI()+'commands/'+command.id+'/send',{data:command}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
    };
});