'use strict';

// Tenant Point service - REST API wrapper
app.factory('TenantPointService', function($http) {
    return {
        // POST create pair
        addPair: function(tenantID,pointID, headers, callback) {
            $http.post(getAPI()+'tenants/'+tenantID+'/points',{data:{'point_id':pointID}}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        // DELETE pair
        deletePair: function(tenantID,pointID, headers, callback) {
            $http.delete(getAPI()+'tenants/'+tenantID+'/points/'+pointID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // GET points by tenant id by ID
        getPointsByTenantID: function(id, headers, callback) {
            $http.get(getAPI()+'tenants/'+id+'/points', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});
