'use strict';
app.factory('SpacePointService', function($http) {
    return {
        addPair: function(spaceID,pointID,callback) {
            $http.post(getAPI()+'spaces/'+spaceID+'/points',{data:{'point_id':pointID}})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        deletePair: function(spaceID,pointID, callback) {
            $http.delete(getAPI()+'spaces/'+spaceID+'/points/'+pointID)
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getPointsBySpaceID: function(id, callback) {
            $http.get(getAPI()+'spaces/'+id+'/points')
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});
