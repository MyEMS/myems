'use strict';
app.factory('GatewayService', function($http) {  
    return {  
        getAllGateways:function(headers, callback){
            $http.get(getAPI() + 'gateways', {headers})  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        searchGateways: function(query, headers, callback) {  
            $http.get(getAPI() + 'gateways', { params: { q: query },headers: headers })  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });  
        },
        addGateway: function(gateway, headers, callback) {  
            $http.post(getAPI() + 'gateways', {data:gateway}, {headers})  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            }); 
        },
        editGateway: function(gateway, headers, callback) {  
            $http.put(getAPI() + 'gateways/' + gateway.id, {data:gateway}, {headers})  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });  
        },
        deleteGateway: function(gateway, headers, callback) {  
            $http.delete(getAPI() + 'gateways/' + gateway.id, {headers})  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });  
        },
        getGateway: function(id, headers, callback) {  
            $http.get(getAPI() + 'gateways/' + id, {headers})  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            }); 
        },
        exportGateway: function(gateway, headers, callback) {
            $http.get(getAPI()+'gateways/'+gateway.id+'/export', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        importGateway: function(importdata, headers, callback) {
            $http.post(getAPI()+'gateways/import', JSON.parse(importdata), {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
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
