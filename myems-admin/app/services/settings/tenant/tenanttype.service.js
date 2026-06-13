'use strict';

// Tenant Type service - REST API wrapper
app.factory('TenantTypeService', function($http) {
    return {
        // GET all tenant types
        getAllTenantTypes:function(headers, callback){
            $http.get(getAPI()+'tenanttypes',  {headers: headers, cache: false})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // Search tenant types by query
        searchTenantTypes: function(query, headers, callback) { 
            $http.get(getAPI() + 'tenanttypes', { params: { q: query } },  {headers: headers})
            .then(function(response) {
                callback(response);
            }, function(response) {
                callback(response);
            });
        },
        // POST create tenant type
        addTenantType: function(tenant_type, headers, callback) {
            $http.post(getAPI()+'tenanttypes',{data:tenant_type},  {headers: headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // PUT update tenant type
        editTenantType: function(tenant_type, headers, callback) {
            $http.put(getAPI()+'tenanttypes/'+tenant_type.id,{data:tenant_type},  {headers: headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // DELETE tenant type
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