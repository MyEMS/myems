'use strict';
app.factory('CommandService', function($http) {  
    return {  
        getAllCommands:function(callback){
            $http.get(getAPI()+'commands')  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        searchCommands: function(query, callback) {  
            $http.get(getAPI()+'commands', { params: { q: query } })  
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
        getCommand: function(id, callback) {  
            $http.get(getAPI()+'commands/'+id)  
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