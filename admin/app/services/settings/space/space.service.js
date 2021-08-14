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
        addSpace: function(space, callback) {
            $http.post(getAPI()+'spaces',{data:space})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        editSpace: function(space, callback) {
            $http.put(getAPI()+'spaces/'+space.id,{data:space})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        deleteSpace: function(space, callback) {
            $http.delete(getAPI()+'spaces/'+space.id)
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});
