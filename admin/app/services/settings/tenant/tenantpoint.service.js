'use strict';
app.factory('TenantPointService', function($http) {
    return {
        addPair: function(tenantID,pointID,callback) {
            $http.post(getAPI()+'tenants/'+tenantID+'/points',{data:{'point_id':pointID}})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        deletePair: function(tenantID,pointID, callback) {
            $http.delete(getAPI()+'tenants/'+tenantID+'/points/'+pointID)
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getPointsByTenantID: function(id, callback) {
            $http.get(getAPI()+'tenants/'+id+'/points')
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});
