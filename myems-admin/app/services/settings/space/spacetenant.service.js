'use strict';

// Space Tenant service - REST API wrapper
app.factory('SpaceTenantService', function($http) {
    return {
        // POST create pair
        addPair: function(spaceID,tenantID, headers, callback) {
            $http.post(getAPI()+'spaces/'+spaceID+'/tenants',{data:{'tenant_id':tenantID}}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        // DELETE pair
        deletePair: function(spaceID, tenantID, headers, callback) {
            $http.delete(getAPI()+'spaces/'+spaceID+'/tenants/'+tenantID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // GET tenants by space id by ID
        getTenantsBySpaceID: function(id, headers, callback) {
            $http.get(getAPI()+'spaces/'+id+'/tenants', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});
