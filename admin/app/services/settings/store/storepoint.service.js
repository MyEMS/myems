'use strict';
app.factory('StorePointService', function($http) {
    return {
        addPair: function(storeID,pointID,callback) {
            $http.post(getAPI()+'stores/'+storeID+'/points',{data:{'point_id':pointID}})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        deletePair: function(storeID,pointID, callback) {
            $http.delete(getAPI()+'stores/'+storeID+'/points/'+pointID)
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getPointsByStoreID: function(id, callback) {
            $http.get(getAPI()+'stores/'+id+'/points')
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});
