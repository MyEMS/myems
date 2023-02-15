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
            $http.get(getAPI() + 'gateways', {params:{q:query}}, {headers})  
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
        }
    };
});  