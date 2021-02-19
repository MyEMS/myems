'use strict';
app.factory('PrivilegeService', function($http) {
    return {
        getAllPrivileges:function(callback){
            $http.get(getAPI()+'privileges')
                .success(function (response, status, headers, config) {
                    callback(null, response);
                })
                .error(function (e, status) {
                    callback(e, status);
                });
        },
        addPrivilege: function(privilege, callback) {
            $http.post(getAPI()+'privileges',{data:privilege})
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e, status) {
                    callback(e, status);
                });
        },
        editPrivilege: function(privilege, callback) {
            $http.put(getAPI()+'privileges/'+privilege.id,{data:privilege})
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e, status) {
                    callback(e, status);
                });
        },
        deletePrivilege: function(privilege, callback) {
            $http.delete(getAPI()+'privileges/'+privilege.id)
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e, status) {
                    callback(e, status);
                });
        },
        getPrivilege: function(id, callback) {
            $http.get(getAPI()+'privileges/'+id)
                .success(function (response, status, headers, config) {
                    callback(null, response);
                })
                .error(function (e) {
                    callback(e);
                });
        }
    };
});
