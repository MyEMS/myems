'use strict';
app.factory('PrivilegeService', function($http) {
    return {
        getAllPrivileges:function(headers, callback){
            $http.get(getAPI()+'privileges', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        addPrivilege: function(privilege, headers, callback) {
            $http.post(getAPI()+'privileges', {data:privilege}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        editPrivilege: function(privilege, headers, callback) {
            $http.put(getAPI()+'privileges/'+privilege.id, {data:privilege}, {headers})
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
        getPrivilege: function(id, headers, callback) {
            $http.get(getAPI()+'privileges/'+id, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});
