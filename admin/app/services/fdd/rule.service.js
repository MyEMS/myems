'use strict';
app.factory('RuleService', function($http) {  
    return {  
        getAllRules:function(headers, callback){
            $http.get(getAPI()+'rules', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        searchRules: function(query, headers, callback) {
            $http.get(getAPI()+'rules', { params: { q: query } }, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        addRule: function(rule, headers, callback) {
            $http.post(getAPI()+'rules', {data:rule}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        editRule: function(rule, headers, callback) {
            $http.put(getAPI()+'rules/'+rule.id,{data:rule}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        deleteRule: function(rule, headers, callback) {
            $http.delete(getAPI()+'rules/'+rule.id, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getRule: function(id, headers, callback) {
            $http.get(getAPI()+'rules/'+id, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});  