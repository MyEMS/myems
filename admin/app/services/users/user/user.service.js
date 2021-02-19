'use strict';
app.factory('UserService', function($http) {  
    return {  
        getAllUsers:function(callback){
            $http.get(getAPI()+'users')  
                .success(function (response, status, headers, config) {  
                    callback(null, response);  
                })  
                .error(function (e) {  
                    callback(e);  
                });
        },
        searchUsers: function(query, callback) {  
            $http.get(getAPI()+'users', { params: { q: query } })  
                .success(function (response, status, headers, config) {  
                    callback(null, response);  
                })  
                .error(function (e) {  
                    callback(e);  
                });  
        },
        addUser: function(user, callback) {  
            $http.post(getAPI()+'users',{data:user})  
                .success(function (response, status, headers, config) {  
                    callback(null, status);  
                })  
                .error(function (e) {  
                    callback(e);  
                });  
        },
        editUser: function(user, callback) {  
            $http.put(getAPI()+'users/'+user.id,{data:user})  
                .success(function (response, status, headers, config) {  
                    callback(null, status);  
                })  
                .error(function (e) {  
                    callback(e);  
                });  
        },
        resetPassword: function(data, headers, callback) {  
            $http.put(getAPI()+'users/resetpassword',{data}, {headers})  
                .success(function (response, status, headers, config) {  
                    callback(null, status);  
                })  
                .error(function (e) {  
                    callback(e);  
                });  
        },
        changePassword: function(data, headers, callback) { 
            $http.put(getAPI()+'users/changepassword', {data}, {headers})  
                .success(function (response, status, headers, config) {  
                    callback(null, status);  
                })  
                .error(function (e, status) {  
                    callback(e, status);  
                });  
        },
        deleteUser: function(user, callback) {  
            $http.delete(getAPI()+'users/'+user.id)  
                .success(function (response, status, headers, config) {  
                    callback(null, status);  
                })  
                .error(function (e) {  
                    callback(e);  
                });  
        },
        getUser: function(id, callback) {  
            $http.get(getAPI()+'users/'+id)  
                .success(function (response, status, headers, config) {  
                    callback(null, response);  
                })  
                .error(function (e) {  
                    callback(e);  
                });  
        }
    };
});  