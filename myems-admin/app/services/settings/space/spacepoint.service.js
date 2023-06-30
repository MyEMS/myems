'use strict';
app.factory('SpacePointService', function($http) {
    return {
        addPair: function(spaceID,pointID, headers, callback) {
            $http.post(getAPI()+'spaces/'+spaceID+'/points',{data:{'point_id':pointID}}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        deletePair: function(spaceID,pointID, headers, callback) {
            $http.delete(getAPI()+'spaces/'+spaceID+'/points/'+pointID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getPointsBySpaceID: function(id, headers, callback) {
            $http.get(getAPI()+'spaces/'+id+'/points', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});
