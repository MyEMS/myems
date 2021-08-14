'use strict';
app.factory('RuleService', function($http) {  
    return {  
        getAllRules:function(callback){
            $http.get(getAPI()+'rules') 
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        searchRules: function(query, callback) {  
            $http.get(getAPI()+'rules', { params: { q: query } }) 
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        addRule: function(rule, callback) {  
            $http.post(getAPI()+'rules',{data:rule}) 
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        editRule: function(rule, callback) {  
            $http.put(getAPI()+'rules/'+rule.id,{data:rule}) 
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        deleteRule: function(rule, callback) {  
            $http.delete(getAPI()+'rules/'+rule.id)  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getRule: function(id, callback) {  
            $http.get(getAPI()+'rules/'+id)
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});  