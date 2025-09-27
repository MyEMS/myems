'use strict';
app.factory('TenantService', function($http) {
    return {
        getAllTenants:function(headers, callback){
            $http.get(getAPI()+'tenants', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
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
        addTenant: function(tenant, headers, callback) {
            $http.post(getAPI()+'tenants',{data:tenant}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        editTenant: function(tenant, headers, callback) {
            $http.put(getAPI()+'tenants/'+tenant.id,{data:tenant}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        deleteTenant: function(tenant, headers, callback) {
            $http.delete(getAPI()+'tenants/'+tenant.id, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        exportTenant: function(tenant, headers, callback) {
            $http.get(getAPI()+'tenants/'+tenant.id+'/export', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        importTenant: function(importdata, headers, callback) {
            $http.post(getAPI()+'tenants/import', JSON.parse(importdata), {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
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
