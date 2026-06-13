'use strict';

// Tenant Command service - REST API wrapper
app.factory('TenantCommandService', function($http) {
    return {
        // POST create pair
        addPair: function(tenantID,commandID, headers, callback) {
            $http.post(getAPI()+'tenants/'+tenantID+'/commands',{data:{'command_id':commandID}}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        // DELETE pair
        deletePair: function(tenantID, commandID, headers, callback) {
            $http.delete(getAPI()+'tenants/'+tenantID+'/commands/'+commandID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // GET commands by tenant id by ID
        getCommandsByTenantID: function(id, headers, callback) {
            $http.get(getAPI()+'tenants/'+id+'/commands', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});