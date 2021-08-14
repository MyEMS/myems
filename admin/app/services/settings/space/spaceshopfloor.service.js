'use strict';
app.factory('SpaceShopfloorService', function($http) {
    return {
        addPair: function(spaceID,shopfloorID,callback) {
            $http.post(getAPI()+'spaces/'+spaceID+'/shopfloors',{data:{'shopfloor_id':shopfloorID}})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        deletePair: function(spaceID, shopfloorID, callback) {
            $http.delete(getAPI()+'spaces/'+spaceID+'/shopfloors/'+shopfloorID)
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getShopfloorsBySpaceID: function(id, callback) {
            $http.get(getAPI()+'spaces/'+id+'/shopfloors')
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});
