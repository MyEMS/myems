'use strict';

// Shop Floor Command service - REST API wrapper
app.factory('ShopfloorCommandService', function($http) {
    return {
        // POST create pair
        addPair: function(shopfloorID,commandID, headers, callback) {
            $http.post(getAPI()+'shopfloors/'+shopfloorID+'/commands',{data:{'command_id':commandID}}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        // DELETE pair
        deletePair: function(shopfloorID, commandID, headers, callback) {
            $http.delete(getAPI()+'shopfloors/'+shopfloorID+'/commands/'+commandID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // GET commands by shopfloor id by ID
        getCommandsByShopfloorID: function(id, headers, callback) {
            $http.get(getAPI()+'shopfloors/'+id+'/commands', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});