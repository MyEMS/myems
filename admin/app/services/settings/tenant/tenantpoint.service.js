'use strict';
app.factory('TenantPointService', function($http) {
    return {
        addPair: function(tenantID,pointID,callback) {
            $http.post(getAPI()+'tenants/'+tenantID+'/points',{data:{'point_id':pointID}})
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e) {
                    callback(e);
                });
        },

        deletePair: function(tenantID,pointID, callback) {
            $http.delete(getAPI()+'tenants/'+tenantID+'/points/'+pointID)
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e) {
                    callback(e);
                });
        },
        getPointsByTenantID: function(id, callback) {
            $http.get(getAPI()+'tenants/'+id+'/points')
                .success(function (response, status, headers, config) {
                    callback(null, response);
                })
                .error(function (e) {
                    callback(e);
                });
        }
    };
});
