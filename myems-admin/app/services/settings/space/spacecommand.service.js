'use strict';

// Space Command service - REST API wrapper
app.factory('SpaceCommandService', function($http) {
    return {
        // POST create pair
        addPair: function(spaceID,commandID, headers, callback) {
            $http.post(getAPI()+'spaces/'+spaceID+'/commands',{data:{'command_id':commandID}}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        // DELETE pair
        deletePair: function(spaceID, commandID, headers, callback) {
            $http.delete(getAPI()+'spaces/'+spaceID+'/commands/'+commandID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // GET commands by space id by ID
        getCommandsBySpaceID: function(id, headers, callback) {
            $http.get(getAPI()+'spaces/'+id+'/commands', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});