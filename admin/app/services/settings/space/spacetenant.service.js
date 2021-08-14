'use strict';
app.factory('SpaceTenantService', function($http) {
    return {
        addPair: function(spaceID,tenantID,callback) {
            $http.post(getAPI()+'spaces/'+spaceID+'/tenants',{data:{'tenant_id':tenantID}})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        deletePair: function(spaceID, tenantID, callback) {
            $http.delete(getAPI()+'spaces/'+spaceID+'/tenants/'+tenantID)
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getTenantsBySpaceID: function(id, callback) {
            $http.get(getAPI()+'spaces/'+id+'/tenants')
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});
