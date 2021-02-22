'use strict';
app.factory('SpaceService', function($http) {
    return {
        getAllSpaces:function(callback){
            $http.get(getAPI()+'spaces')
                .success(function (response, status, headers, config) {
                    callback(null, response);
                })
                .error(function (e) {
                    callback(e);
                });
        },
        getSpaceChildren:function(spaceid, callback){
            $http.get(getAPI()+'spaces/'+spaceid+'/children')
                .success(function (response, status, headers, config) {
                    callback(null, response);
                })
                .error(function (e) {
                    callback(e);
                });
        },
        getAllTimezones:function(callback){
            $http.get(getAPI()+'timezones')
                .success(function (response, status, headers, config) {
                    callback(null, response);
                })
                .error(function (e) {
                    callback(e);
                });
        },
        searchSpaces: function(query, callback) {
            $http.get(getAPI()+'spaces', { params: { q: query } })
                .success(function (response, status, headers, config) {
                    callback(null, response);
                })
                .error(function (e) {
                    callback(e);
                });
        },
        addSpace: function(space, callback) {
            $http.post(getAPI()+'spaces',{data:space})
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e) {
                    callback(e);
                });
        },
        editSpace: function(space, callback) {
            $http.put(getAPI()+'spaces/'+space.id,{data:space})
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e) {
                    callback(e);
                });
        },
        deleteSpace: function(space, callback) {
            $http.delete(getAPI()+'spaces/'+space.id)
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e,status) {
                    callback(e,status);
                });
        }
    };
});
