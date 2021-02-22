'use strict';
app.factory('GatewayService', function($http) {  
    return {  
        getAllGateways:function(callback){
            $http.get(getAPI()+'gateways')  
                .success(function (response, status, headers, config) {  
                    callback(null, response);  
                })  
                .error(function (e,status) {  
                    callback(e,status);  
                });
        },
        searchGateways: function(query, callback) {  
            $http.get(getAPI()+'gateways', { params: { q: query } })  
                .success(function (response, status, headers, config) {  
                    callback(null, response);  
                })  
                .error(function (e,status) {  
                    callback(e,status);  
                });  
        },
        addGateway: function(gateway, callback) {  
            $http.post(getAPI()+'gateways',{data:gateway})  
                .success(function (response, status, headers, config) {  
                    callback(null, status);  
                })  
                .error(function (e,status) {  
                    callback(e,status);  
                });  
        },
        editGateway: function(gateway, callback) {  
            $http.put(getAPI()+'gateways/'+gateway.id,{data:gateway})  
                .success(function (response, status, headers, config) {  
                    callback(null, status);  
                })  
                .error(function (e,status) {  
                    callback(e,status);  
                });  
        },
        deleteGateway: function(gateway, callback) {  
            $http.delete(getAPI()+'gateways/'+gateway.id)  
                .success(function (response, status, headers, config) {  
                    callback(null, status);  
                })  
                .error(function (e,status) {  
                    callback(e,status);  
                });  
        },
        getGateway: function(id, callback) {  
            $http.get(getAPI()+'gateways/'+id)  
                .success(function (response, status, headers, config) {  
                    callback(null, response);  
                })  
                .error(function (e,status) {  
                    callback(e,status);  
                });  
        }
    };
});  