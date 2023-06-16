'use strict';
app.factory('PersonalTokenService', function($http) {
    return {
        getAllPersonalTokens:function(callback){
            $http.get(getAPI()+'personaltokens')
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        addPersonalToken: function(personaltoken, headers, callback) {
            $http.post(getAPI()+'personaltokens', {data:personaltoken}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        editPersonalToken: function(personaltoken, headers, callback) {
            $http.put(getAPI()+'personaltokens/'+personaltoken.id, {data:personaltoken}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        deletePersonalToken: function(personaltoken, headers, callback) {
            $http.delete(getAPI()+'personaltokens/'+personaltoken.id, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getPersonalToken: function(id, callback) {
            $http.get(getAPI()+'personaltokens/'+id)
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});
