'use strict';
app.factory('LoginService', function($http) {  
    return {  
        
        login: function(user, callback) {  
            $http.put(getAPI()+'users/login',{data:user})  
                .success(function (response, status, headers, config) {  
                    callback(response,null,status,headers);  
                })  
                .error(function (e,status) {  
                    callback(e,status);  
                });  
        },
        logout: function(data, headers, callback) {  
            console.log(data);
            console.log(headers);
            $http.put(getAPI()+'users/logout', {data}, {headers})
                .success(function (response, status, headers, config) {  
                    callback(null,status,headers);  
                })  
                .error(function (e) {  
                    callback(e);  
                });  
        },
        
    };
});  