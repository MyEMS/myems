'use strict';
app.factory('ShopfloorPointService', function($http) {
    return {
        addPair: function(shopfloorID,pointID,callback) {
            $http.post(getAPI()+'shopfloors/'+shopfloorID+'/points',{data:{'point_id':pointID}})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        deletePair: function(shopfloorID,pointID, callback) {
            $http.delete(getAPI()+'shopfloors/'+shopfloorID+'/points/'+pointID)
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getPointsByShopfloorID: function(id, callback) {
            $http.get(getAPI()+'shopfloors/'+id+'/points')
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});
