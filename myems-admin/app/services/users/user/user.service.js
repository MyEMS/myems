'use strict';
app.factory('UserService', function($http) {  
    return {  
        getAllUsers:function(headers, callback){
            $http.get(getAPI()+'users', {headers})  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        searchUsers: function(query, callback) {  
            $http.get(getAPI()+'users', { params: { q: query } })  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        addUser: function(user, headers, callback) {  
            $http.post(getAPI()+'users', {data:user}, {headers})  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        editUser: function(user, headers, callback) {  
            $http.put(getAPI()+'users/'+user.id, {data:user}, {headers})  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        resetPassword: function(data, headers, callback) {  
            $http.put(getAPI()+'users/resetpassword',{data}, {headers})  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        changePassword: function(data, headers, callback) { 
            $http.put(getAPI()+'users/changepassword', {data}, {headers})  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            }); 
        },
        deleteUser: function(user, headers, callback) {  
            $http.delete(getAPI()+'users/'+user.id, {headers})  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getUser: function(id, headers, callback) {  
            $http.get(getAPI()+'users/'+id, {headers})  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            }); 
        },
        unlockUser: function(user, headers, callback){
            $http.put(getAPI()+'users/unlock/'+ user.id, {user}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        deleteNewUser: function(user, headers, callback) {  
            $http.delete(getAPI()+'users/new/'+user.id, {headers})  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        editNewUser: function(user, headers, callback) {  
            $http.put(getAPI()+'users/new/'+user.id, {"data":user}, {headers})  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getAllNewUsers: function(headers, callback) {  
            $http.get(getAPI()+'users/new', {headers})  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            }); 
        },
        getNewUser: function(id, headers, callback) {  
            $http.get(getAPI()+'users/new/'+id, {headers})  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            }); 
        },
        approveUser: function(user, headers, callback){
            $http.post(getAPI()+'users/approve', {"data":user}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});  