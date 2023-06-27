'use strict';
app.factory('TenantPointService', function($http) {
    return {
        addPair: function(tenantID,pointID, headers, callback) {
            $http.post(getAPI()+'tenants/'+tenantID+'/points',{data:{'point_id':pointID}}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        deletePair: function(tenantID,pointID, headers, callback) {
            $http.delete(getAPI()+'tenants/'+tenantID+'/points/'+pointID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
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
