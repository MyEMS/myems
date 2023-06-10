'use strict';
app.factory('StoreCommandService', function($http) {
    return {
        addPair: function(storeID,commandID, headers, callback) {
            $http.post(getAPI()+'stores/'+storeID+'/commands',{data:{'command_id':commandID}}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        deletePair: function(storeID, commandID, headers, callback) {
            $http.delete(getAPI()+'stores/'+storeID+'/commands/'+commandID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getCommandsByStoreID: function(id, callback) {
            $http.get(getAPI()+'stores/'+id+'/commands')
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});