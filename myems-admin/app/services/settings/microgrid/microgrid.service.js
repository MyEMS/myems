'use strict';

// Microgrid service - REST API wrapper
app.factory('MicrogridService', function($http) {
    return {
        // GET all microgrids
        getAllMicrogrids:function(headers, callback){
            $http.get(getAPI()+'microgrids', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // Search microgrids by query
        searchMicrogrids: function(query, headers, callback) {
            $http.get(getAPI()+'microgrids', { params: { q: query },headers: headers })
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // POST create microgrid
        addMicrogrid: function(microgrid, headers, callback) {
            $http.post(getAPI()+'microgrids',{data:microgrid}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // PUT update microgrid
        editMicrogrid: function(microgrid, headers, callback) {
            $http.put(getAPI()+'microgrids/'+microgrid.id,{data:microgrid}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // DELETE microgrid
        deleteMicrogrid: function(microgrid, headers, callback) {
            $http.delete(getAPI()+'microgrids/'+microgrid.id, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // GET export microgrid
        exportMicrogrid: function(microgrid, headers, callback) {
            $http.get(getAPI()+'microgrids/'+microgrid.id+'/export', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // POST import microgrid
        importMicrogrid: function(importdata, headers, callback) {
            $http.post(getAPI()+'microgrids/import', JSON.parse(importdata), {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // POST clone microgrid
        cloneMicrogrid: function(microgrid, headers, callback) {
            $http.post(getAPI()+'microgrids/'+microgrid.id+'/clone', {data:null}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
    };
});
