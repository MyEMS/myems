'use strict';
app.factory('SpaceCommandService', function($http) {
    return {
        addPair: function(spaceID,commandID, headers, callback) {
            $http.post(getAPI()+'spaces/'+spaceID+'/commands',{data:{'command_id':commandID}}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        deletePair: function(spaceID, commandID, headers, callback) {
            $http.delete(getAPI()+'spaces/'+spaceID+'/commands/'+commandID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getCommandsBySpaceID: function(id, callback) {
            $http.get(getAPI()+'spaces/'+id+'/commands')
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});