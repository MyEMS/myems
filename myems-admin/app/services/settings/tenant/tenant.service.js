'use strict';

// Tenant service - REST API wrapper
app.factory('TenantService', function($http) {
    return {
        // GET all tenants
        getAllTenants:function(headers, callback){
            $http.get(getAPI()+'tenants', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // Search tenants by query
        searchTenants: function(query,headers, callback) {
            $http.get(getAPI()+'tenants', {
                params: { q: query },
                headers: headers
            })
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // POST create tenant
        addTenant: function(tenant, headers, callback) {
            $http.post(getAPI()+'tenants',{data:tenant}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // PUT update tenant
        editTenant: function(tenant, headers, callback) {
            $http.put(getAPI()+'tenants/'+tenant.id,{data:tenant}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // DELETE tenant
        deleteTenant: function(tenant, headers, callback) {
            $http.delete(getAPI()+'tenants/'+tenant.id, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // GET export tenant
        exportTenant: function(tenant, headers, callback) {
            $http.get(getAPI()+'tenants/'+tenant.id+'/export', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // POST import tenant
        importTenant: function(importdata, headers, callback) {
            $http.post(getAPI()+'tenants/import', JSON.parse(importdata), {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // POST clone tenant
        cloneTenant: function(tenant, headers, callback) {
            $http.post(getAPI()+'tenants/'+tenant.id+'/clone', {data:null}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
    };
});
