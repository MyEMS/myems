'use strict';
app.factory('SpacePointService', function($http) {
    return {
        addPair: function(spaceID,pointID,callback) {
            $http.post(getAPI()+'spaces/'+spaceID+'/points',{data:{'point_id':pointID}})
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e) {
                    callback(e);
                });
        },

        deletePair: function(spaceID,pointID, callback) {
            $http.delete(getAPI()+'spaces/'+spaceID+'/points/'+pointID)
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e) {
                    callback(e);
                });
        },
        getPointsBySpaceID: function(id, callback) {
            $http.get(getAPI()+'spaces/'+id+'/points')
                .success(function (response, status, headers, config) {
                    callback(null, response);
                })
                .error(function (e) {
                    callback(e);
                });
        }
    };
});
