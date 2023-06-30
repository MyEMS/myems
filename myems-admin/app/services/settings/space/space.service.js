'use strict';
app.factory('SpaceService', function($http) {
    return {
        getAllSpaces:function(headers, callback){
            $http.get(getAPI()+'spaces', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getSpaceChildren:function(spaceid, headers, callback){
            $http.get(getAPI()+'spaces/'+spaceid+'/children', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getAllTimezones:function(headers, callback){
            $http.get(getAPI()+'timezones', {headers})
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
