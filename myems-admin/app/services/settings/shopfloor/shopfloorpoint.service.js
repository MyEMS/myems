'use strict';
app.factory('ShopfloorPointService', function($http) {
    return {
        addPair: function(shopfloorID,pointID, headers, callback) {
            $http.post(getAPI()+'shopfloors/'+shopfloorID+'/points',{data:{'point_id':pointID}}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        deletePair: function(shopfloorID,pointID, headers, callback) {
            $http.delete(getAPI()+'shopfloors/'+shopfloorID+'/points/'+pointID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getPointsByShopfloorID: function(id, headers, callback) {
            $http.get(getAPI()+'shopfloors/'+id+'/points')
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});
