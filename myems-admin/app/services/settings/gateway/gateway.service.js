'use strict';

// Gateway service - REST API wrapper
app.factory('GatewayService', function($http) {  
    return {  
        // GET all gateways
        getAllGateways:function(headers, callback){
            $http.get(getAPI() + 'gateways', {headers})  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // Search gateways by query
        searchGateways: function(query, headers, callback) {  
            $http.get(getAPI() + 'gateways', { params: { q: query },headers: headers })  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });  
        },
        // POST create gateway
        addGateway: function(gateway, headers, callback) {  
            $http.post(getAPI() + 'gateways', {data:gateway}, {headers})  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            }); 
        },
        // PUT update gateway
        editGateway: function(gateway, headers, callback) {  
            $http.put(getAPI() + 'gateways/' + gateway.id, {data:gateway}, {headers})  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });  
        },
        // DELETE gateway
        deleteGateway: function(gateway, headers, callback) {  
            $http.delete(getAPI() + 'gateways/' + gateway.id, {headers})  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });  
        },
        // GET gateway by ID
        getGateway: function(id, headers, callback) {  
            $http.get(getAPI() + 'gateways/' + id, {headers})  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            }); 
        },
        // GET export gateway
        exportGateway: function(gateway, headers, callback) {
            $http.get(getAPI()+'gateways/'+gateway.id+'/export', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // POST import gateway
        importGateway: function(importdata, headers, callback) {
            $http.post(getAPI()+'gateways/import', JSON.parse(importdata), {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // POST clone gateway
        cloneGateway: function(gateway, headers, callback) {
            $http.post(getAPI()+'gateways/'+gateway.id+'/clone', {data:null}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});  
