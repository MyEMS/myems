'use strict';

// Shop Floor Point service - REST API wrapper
app.factory('ShopfloorPointService', function($http) {
    return {
        // POST create pair
        addPair: function(shopfloorID,pointID, headers, callback) {
            $http.post(getAPI()+'shopfloors/'+shopfloorID+'/points',{data:{'point_id':pointID}}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        // DELETE pair
        deletePair: function(shopfloorID,pointID, headers, callback) {
            $http.delete(getAPI()+'shopfloors/'+shopfloorID+'/points/'+pointID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // GET points by shopfloor id by ID
        getPointsByShopfloorID: function(id, headers, callback) {
            $http.get(getAPI()+'shopfloors/'+id+'/points', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});
