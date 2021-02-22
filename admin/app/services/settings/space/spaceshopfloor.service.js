'use strict';
app.factory('SpaceShopfloorService', function($http) {
    return {
        addPair: function(spaceID,shopfloorID,callback) {
            $http.post(getAPI()+'spaces/'+spaceID+'/shopfloors',{data:{'shopfloor_id':shopfloorID}})
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e) {
                    callback(e);
                });
        },

        deletePair: function(spaceID, shopfloorID, callback) {
            $http.delete(getAPI()+'spaces/'+spaceID+'/shopfloors/'+shopfloorID)
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e) {
                    callback(e);
                });
        },
        getShopfloorsBySpaceID: function(id, callback) {
            $http.get(getAPI()+'spaces/'+id+'/shopfloors')
                .success(function (response, status, headers, config) {
                    callback(null, response);
                })
                .error(function (e) {
                    callback(e);
                });
        }
    };
});
