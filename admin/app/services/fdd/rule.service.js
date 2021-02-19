'use strict';
app.factory('RuleService', function($http) {  
    return {  
        getAllRules:function(callback){
            $http.get(getAPI()+'rules')  
                .success(function (response, status, headers, config) {  
                    callback(null, response);  
                })  
                .error(function (e,status) {  
                    callback(e,status);  
                });
        },
        searchRules: function(query, callback) {  
            $http.get(getAPI()+'rules', { params: { q: query } })  
                .success(function (response, status, headers, config) {  
                    callback(null, response);  
                })  
                .error(function (e,status) {  
                    callback(e,status);  
                });  
        },
        addRule: function(rule, callback) {  
            $http.post(getAPI()+'rules',{data:rule})  
                .success(function (response, status, headers, config) {  
                    callback(null, status);  
                })  
                .error(function (e,status) {  
                    callback(e,status);  
                });  
        },
        editRule: function(rule, callback) {  
            $http.put(getAPI()+'rules/'+rule.id,{data:rule})  
                .success(function (response, status, headers, config) {  
                    callback(null, status);  
                })  
                .error(function (e,status) {  
                    callback(e,status);  
                });  
        },
        deleteRule: function(rule, callback) {  
            $http.delete(getAPI()+'rules/'+rule.id)  
                .success(function (response, status, headers, config) {  
                    callback(null, status);  
                })  
                .error(function (e,status) {  
                    callback(e,status);  
                });  
        },
        getRule: function(id, callback) {  
            $http.get(getAPI()+'rules/'+id)  
                .success(function (response, status, headers, config) {  
                    callback(null, response);  
                })  
                .error(function (e,status) {  
                    callback(e,status);  
                });  
        }
    };
});  