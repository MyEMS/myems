'use strict';

// Store Command service - REST API wrapper
app.factory('StoreCommandService', function($http) {
    return {
        // POST create pair
        addPair: function(storeID,commandID, headers, callback) {
            $http.post(getAPI()+'stores/'+storeID+'/commands',{data:{'command_id':commandID}}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        // DELETE pair
        deletePair: function(storeID, commandID, headers, callback) {
            $http.delete(getAPI()+'stores/'+storeID+'/commands/'+commandID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // GET commands by store id by ID
        getCommandsByStoreID: function(id, headers, callback) {
            $http.get(getAPI()+'stores/'+id+'/commands', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});