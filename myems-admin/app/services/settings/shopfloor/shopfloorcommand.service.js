'use strict';
app.factory('ShopfloorCommandService', function($http) {
    return {
        addPair: function(shopfloorID,commandID, headers, callback) {
            $http.post(getAPI()+'shopfloors/'+shopfloorID+'/commands',{data:{'command_id':commandID}}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        deletePair: function(shopfloorID, commandID, headers, callback) {
            $http.delete(getAPI()+'shopfloors/'+shopfloorID+'/commands/'+commandID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getCommandsByShopfloorID: function(id, callback) {
            $http.get(getAPI()+'shopfloors/'+id+'/commands')
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});