'use strict';
app.factory('GatewayService', function($http) {  
    return {  
        getAllGateways:function(callback){
            $http.get(getAPI()+'gateways')  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        searchGateways: function(query, callback) {  
            $http.get(getAPI()+'gateways', { params: { q: query } })  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });  
        },
        addGateway: function(gateway, callback) {  
            $http.post(getAPI()+'gateways',{data:gateway})  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            }); 
        },
        editGateway: function(gateway, callback) {  
            $http.put(getAPI()+'gateways/'+gateway.id,{data:gateway})  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });  
        },
        deleteGateway: function(gateway, callback) {  
            $http.delete(getAPI()+'gateways/'+gateway.id)  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });  
        },
        getGateway: function(id, callback) {  
            $http.get(getAPI()+'gateways/'+id)  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            }); 
        }
    };
});  