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
        addPrivilege: function(privilege, headers, callback) {
            $http.post(getAPI()+'privileges', {headers}, {data:privilege})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        editPrivilege: function(privilege, headers, callback) {
            $http.put(getAPI()+'privileges/'+privilege.id, {headers}, {data:privilege})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        deletePrivilege: function(privilege, headers, callback) {
            $http.delete(getAPI()+'privileges/'+privilege.id, {headers})
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
