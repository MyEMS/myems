'use strict';
app.factory('TenantTypeService', function($http) {
    return {
        getAllTenantTypes:function(callback){
            $http.get(getAPI()+'tenanttypes')
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        searchTenantTypes: function(query, callback) {
            $http.get(getAPI()+'tenanttypes', { params: { q: query } })
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        addTenantType: function(tenant_type, headers, callback) {
            $http.post(getAPI()+'tenanttypes',{data:tenant}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        editTenantType: function(tenant_type, headers, callback) {
            $http.put(getAPI()+'tenanttypes/'+tenant_type.id,{data:tenant_type}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        deleteTenantType: function(tenant_type, headers, callback) {
            $http.delete(getAPI()+'tenanttypes/'+tenant_type.id, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
    };
});
