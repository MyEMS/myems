'use strict';
app.factory('SpaceService', function($http) {
    return {
        getAllSpaces:function(callback){
            $http.get(getAPI()+'spaces')
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getSpaceChildren:function(spaceid, callback){
            $http.get(getAPI()+'spaces/'+spaceid+'/children')
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getAllTimezones:function(callback){
            $http.get(getAPI()+'timezones')
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        searchSpaces: function(query, callback) {
            $http.get(getAPI()+'spaces', { params: { q: query } })
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        addSpace: function(space, headers, callback) {
            $http.post(getAPI()+'spaces',{data:space}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        editSpace: function(space, headers, callback) {
            $http.put(getAPI()+'spaces/'+space.id,{data:space}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        deleteSpace: function(space, headers, callback) {
            $http.delete(getAPI()+'spaces/'+space.id, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});
