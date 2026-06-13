'use strict';

// Space Point service - REST API wrapper
app.factory('SpacePointService', function($http) {
    return {
        // POST create pair
        addPair: function(spaceID,pointID, headers, callback) {
            $http.post(getAPI()+'spaces/'+spaceID+'/points',{data:{'point_id':pointID}}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        // DELETE pair
        deletePair: function(spaceID,pointID, headers, callback) {
            $http.delete(getAPI()+'spaces/'+spaceID+'/points/'+pointID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // GET points by space id by ID
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
