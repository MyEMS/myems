'use strict';
app.factory('MicrogridService', function($http) {
    return {
        getAllMicrogrids:function(headers, callback){
            $http.get(getAPI()+'microgrids', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        searchMicrogrids: function(query, headers, callback) {
            $http.get(getAPI()+'microgrids', { params: { q: query },headers: headers })
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        addMicrogrid: function(microgrid, headers, callback) {
            $http.post(getAPI()+'microgrids',{data:microgrid}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        editMicrogrid: function(microgrid, headers, callback) {
            $http.put(getAPI()+'microgrids/'+microgrid.id,{data:microgrid}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        deleteMicrogrid: function(microgrid, headers, callback) {
            $http.delete(getAPI()+'microgrids/'+microgrid.id, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        exportMicrogrid: function(microgrid, headers, callback) {
            $http.get(getAPI()+'microgrids/'+microgrid.id+'/export', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        importMicrogrid: function(importdata, headers, callback) {
            $http.post(getAPI()+'microgrids/import', JSON.parse(importdata), {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
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
