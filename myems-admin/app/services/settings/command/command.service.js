'use strict';

// Command service - REST API wrapper
app.factory('CommandService', function($http) {
    return {
        // GET all commands
        getAllCommands:function(headers, callback){
            $http.get(getAPI()+'commands', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // Search commands by query
        searchCommands: function(query, headers, callback) {
            $http.get(getAPI()+'commands', {
                params: {q: query},
                headers: headers
            })
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // POST create command
        addCommand: function(command, headers, callback) {
            $http.post(getAPI()+'commands',{data:command}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // PUT update command
        editCommand: function(command, headers, callback) {
            $http.put(getAPI()+'commands/'+command.id,{data:command}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // DELETE command
        deleteCommand: function(command, headers, callback) {
            $http.delete(getAPI()+'commands/'+command.id, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // API: send command
        sendCommand: function(command, headers, callback) {
            $http.put(getAPI()+'commands/'+command.id+'/send',{data:command}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // GET export command
        exportCommand: function(command, headers, callback) {
            $http.get(getAPI()+'commands/'+command.id+'/export', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // POST import command
        importCommand: function(importdata, headers, callback) {
            $http.post(getAPI()+'commands/import', JSON.parse(importdata), {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // POST clone command
        cloneCommand: function(command, headers, callback) {
            $http.post(getAPI()+'commands/'+command.id+'/clone', {data:null}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
    };
});