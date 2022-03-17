'use strict';
app.factory('LoginService', function($http) {  
    return {  
        
        login: function(user, callback) {  
            $http.put(getAPI()+'users/login',{data:user}) 
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        logout: function(data, headers, callback) {  
            $http.put(getAPI()+'users/logout', {data}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        
    };
});  