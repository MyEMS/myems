'use strict';
app.factory('SpaceShopfloorService', function($http) {
    return {
        addPair: function(spaceID,shopfloorID, headers, callback) {
            $http.post(getAPI()+'spaces/'+spaceID+'/shopfloors',{data:{'shopfloor_id':shopfloorID}}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        deletePair: function(spaceID, shopfloorID, headers, callback) {
            $http.delete(getAPI()+'spaces/'+spaceID+'/shopfloors/'+shopfloorID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
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
