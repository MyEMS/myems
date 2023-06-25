'use strict';
app.factory('TenantCommandService', function($http) {
    return {
        addPair: function(tenantID,commandID, headers, callback) {
            $http.post(getAPI()+'tenants/'+tenantID+'/commands',{data:{'command_id':commandID}}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        deletePair: function(tenantID, commandID, headers, callback) {
            $http.delete(getAPI()+'tenants/'+tenantID+'/commands/'+commandID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
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