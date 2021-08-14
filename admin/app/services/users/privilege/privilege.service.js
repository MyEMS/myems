'use strict';
app.factory('PrivilegeService', function($http) {
    return {
        getAllPrivileges:function(callback){
            $http.get(getAPI()+'privileges')
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        addPrivilege: function(privilege, callback) {
            $http.post(getAPI()+'privileges',{data:privilege})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        editPrivilege: function(privilege, callback) {
            $http.put(getAPI()+'privileges/'+privilege.id,{data:privilege})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        deletePrivilege: function(privilege, callback) {
            $http.delete(getAPI()+'privileges/'+privilege.id)
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getPrivilege: function(id, callback) {
            $http.get(getAPI()+'privileges/'+id)
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});
