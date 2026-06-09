'use strict';

// Space Shop Floor service - REST API wrapper
app.factory('SpaceShopfloorService', function($http) {
    return {
        // POST create pair
        addPair: function(spaceID,shopfloorID, headers, callback) {
            $http.post(getAPI()+'spaces/'+spaceID+'/shopfloors',{data:{'shopfloor_id':shopfloorID}}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        // DELETE pair
        deletePair: function(spaceID, shopfloorID, headers, callback) {
            $http.delete(getAPI()+'spaces/'+spaceID+'/shopfloors/'+shopfloorID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // GET shopfloors by space id by ID
        getShopfloorsBySpaceID: function(id, headers, callback) {
            $http.get(getAPI()+'spaces/'+id+'/shopfloors', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});
