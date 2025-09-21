'use strict';
app.factory('MeterService', function($http) {
    return {
        getAllMeters:function(headers, callback){
            $http.get(getAPI()+'meters', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getMeterSubmeters:function(meterid, headers, callback){
            $http.get(getAPI()+'meters/'+meterid+'/submeters', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        searchMeters: function(query, headers, callback) {
            $http.get(getAPI()+'meters', {
                params: { q: query },
                headers: headers
            })
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        addMeter: function(meter, headers, callback) {
            $http.post(getAPI()+'meters',{data:meter}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        editMeter: function(meter, headers, callback) {
            $http.put(getAPI()+'meters/'+meter.id,{data:meter}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        deleteMeter: function(meter, headers, callback) {
            $http.delete(getAPI()+'meters/'+meter.id, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getMeter: function(id, headers, callback) {
            $http.get(getAPI()+'meters/'+id, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        exportMeter: function(meter, headers, callback) {
            $http.get(getAPI()+'meters/'+meter.id+'/export', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        importMeter: function(importdata, headers, callback) {
            $http.post(getAPI()+'meters/import', JSON.parse(importdata), {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        cloneMeter: function(meter, headers, callback) {
            $http.post(getAPI()+'meters/'+meter.id+'/clone', {data:null}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});
