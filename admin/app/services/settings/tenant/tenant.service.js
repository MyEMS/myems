'use strict';
app.factory('TenantService', function($http) {
    return {
        getAllTenants:function(callback){
            $http.get(getAPI()+'tenants')
                .success(function (response, status, headers, config) {
                    callback(null, response);
                })
                .error(function (e) {
                    callback(e);
                });
        },
        searchTenants: function(query, callback) {
            $http.get(getAPI()+'tenants', { params: { q: query } })
                .success(function (response, status, headers, config) {
                    callback(null, response);
                })
                .error(function (e) {
                    callback(e);
                });
        },
        addTenant: function(tenant, callback) {
            $http.post(getAPI()+'tenants',{data:tenant})
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e) {
                    callback(e);
                });
        },
        editTenant: function(tenant, callback) {
            $http.put(getAPI()+'tenants/'+tenant.id,{data:tenant})
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e) {
                    callback(e);
                });
        },
        deleteTenant: function(tenant, callback) {
            $http.delete(getAPI()+'tenants/'+tenant.id)
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e,status) {
                    callback(e,status);
                });
        },
    };
});
