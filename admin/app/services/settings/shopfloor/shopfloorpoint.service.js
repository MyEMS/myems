'use strict';
app.factory('ShopfloorPointService', function($http) {
    return {
        addPair: function(shopfloorID,pointID,callback) {
            $http.post(getAPI()+'shopfloors/'+shopfloorID+'/points',{data:{'point_id':pointID}})
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e) {
                    callback(e);
                });
        },

        deletePair: function(shopfloorID,pointID, callback) {
            $http.delete(getAPI()+'shopfloors/'+shopfloorID+'/points/'+pointID)
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e) {
                    callback(e);
                });
        },
        getPointsByShopfloorID: function(id, callback) {
            $http.get(getAPI()+'shopfloors/'+id+'/points')
                .success(function (response, status, headers, config) {
                    callback(null, response);
                })
                .error(function (e) {
                    callback(e);
                });
        }
    };
});
