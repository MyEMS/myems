'use strict';
app.factory('SpaceTenantService', function($http) {
    return {
        addPair: function(spaceID,tenantID,callback) {
            $http.post(getAPI()+'spaces/'+spaceID+'/tenants',{data:{'tenant_id':tenantID}})
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e) {
                    callback(e);
                });
        },

        deletePair: function(spaceID, tenantID, callback) {
            $http.delete(getAPI()+'spaces/'+spaceID+'/tenants/'+tenantID)
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e) {
                    callback(e);
                });
        },
        getTenantsBySpaceID: function(id, callback) {
            $http.get(getAPI()+'spaces/'+id+'/tenants')
                .success(function (response, status, headers, config) {
                    callback(null, response);
                })
                .error(function (e) {
                    callback(e);
                });
        }
    };
});
