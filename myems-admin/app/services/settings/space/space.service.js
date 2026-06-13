'use strict';

// Space service - REST API wrapper
app.factory('SpaceService', function($http) {
    return {
        // GET all spaces
        getAllSpaces:function(headers, callback){
            $http.get(getAPI()+'spaces', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // GET space children by ID
        getSpaceChildren:function(spaceid, headers, callback){
            $http.get(getAPI()+'spaces/'+spaceid+'/children', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // GET all timezones
        getAllTimezones:function(headers, callback){
            $http.get(getAPI()+'timezones', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // Search spaces by query
        searchSpaces: function(query, callback) {
            $http.get(getAPI()+'spaces', { params: { q: query } })
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // POST create space
        addSpace: function(space, headers, callback) {
            $http.post(getAPI()+'spaces',{data:space}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // PUT update space
        editSpace: function(space, headers, callback) {
            $http.put(getAPI()+'spaces/'+space.id,{data:space}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // DELETE space
        deleteSpace: function(space, headers, callback) {
            $http.delete(getAPI()+'spaces/'+space.id, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // GET export space
        exportSpace: function(space, headers, callback) {
            $http.get(getAPI()+'spaces/'+space.id+'/export', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // POST import space
        importSpace: function(importdata, headers, callback) {
            $http.post(getAPI()+'spaces/import', JSON.parse(importdata), {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // POST clone space
        cloneSpace: function(space, headers, callback) {
            $http.post(getAPI()+'spaces/'+space.id+'/clone', {data:null}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
    };
});
