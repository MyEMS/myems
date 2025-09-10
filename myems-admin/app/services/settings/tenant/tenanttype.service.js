'use strict';
app.factory('TenantTypeService', function($http) {
    return {
        getAllTenantTypes:function(headers, callback){
            $http.get(getAPI()+'tenanttypes',  {headers: headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        searchTenantTypes: function(query, headers, callback) { 
            $http.get(getAPI() + 'tenanttypes', { params: { q: query } },  {headers: headers})
            .then(function(response) {
                callback(response);
            }, function(response) {
                callback(response);
            });
        },
        addTenantType: function(tenant_type, headers, callback) {
            $http.post(getAPI()+'tenanttypes',{data:tenant_type},  {headers: headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        editTenantType: function(tenant_type, headers, callback) {
            $http.put(getAPI()+'tenanttypes/'+tenant_type.id,{data:tenant_type},  {headers: headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        deleteTenantType: function(tenant_type, headers, callback) {
            $http.delete(getAPI()+'tenanttypes/'+tenant_type.id,  {headers: headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
    };
});    