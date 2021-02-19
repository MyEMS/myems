'use strict';
app.factory('TenantTypeService', function($http) {
    return {
        getAllTenantTypes:function(callback){
            $http.get(getAPI()+'tenanttypes')
                .success(function (response, status, headers, config) {
                    callback(null, response);
                })
                .error(function (e) {
                    callback(e);
                });
        },
        searchTenantTypes: function(query, callback) {
            $http.get(getAPI()+'tenanttypes', { params: { q: query } })
                .success(function (response, status, headers, config) {
                    callback(null, response);
                })
                .error(function (e) {
                    callback(e);
                });
        },
        addTenantType: function(tenant_type, callback) {
            $http.post(getAPI()+'tenanttypes',{data:tenant})
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e) {
                    callback(e);
                });
        },
        editTenantType: function(tenant_type, callback) {
            $http.put(getAPI()+'tenanttypes/'+tenant_type.id,{data:tenant_type})
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e) {
                    callback(e);
                });
        },
        deleteTenantType: function(tenant_type, callback) {
            $http.delete(getAPI()+'tenanttypes/'+tenant_type.id)
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e,status) {
                    callback(e,status);
                });
        },
    };
});
