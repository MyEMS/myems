'use strict';
app.factory('TenantService', function($http) {
    return {
        getAllTenants:function(callback){
            $http.get(getAPI()+'tenants')
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        searchTenants: function(query, callback) {
            $http.get(getAPI()+'tenants', { params: { q: query } })
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        addTenant: function(tenant, callback) {
            $http.post(getAPI()+'tenants',{data:tenant})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        editTenant: function(tenant, callback) {
            $http.put(getAPI()+'tenants/'+tenant.id,{data:tenant})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        deleteTenant: function(tenant, callback) {
            $http.delete(getAPI()+'tenants/'+tenant.id)
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
    };
});
