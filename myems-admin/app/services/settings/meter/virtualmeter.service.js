'use strict';
app.factory('VirtualMeterService', function($http) {
    return {
        getAllVirtualMeters:function(headers, callback){
            $http.get(getAPI()+'virtualmeters', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        searchVirtualMeters: function(query,headers,  callback) {
            $http.get(getAPI()+'virtualmeters', {
                params: { q: query },
                headers: headers
            })
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        addVirtualMeter: function(virtualmeter, headers, callback) {
            $http.post(getAPI()+'virtualmeters',{data:virtualmeter}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        editVirtualMeter: function(virtualmeter, headers, callback) {
            $http.put(getAPI()+'virtualmeters/'+virtualmeter.id,{data:virtualmeter}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        deleteVirtualMeter: function(virtualmeter, headers, callback) {
            $http.delete(getAPI()+'virtualmeters/'+virtualmeter.id, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        exportVirtualMeter: function(virtualmeter, headers, callback) {
            $http.get(getAPI()+'virtualmeters/'+virtualmeter.id+'/export', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        importVirtualMeter: function(importdata, headers, callback) {
            $http.post(getAPI()+'virtualmeters/import', JSON.parse(importdata), {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        cloneVirtualMeter: function(virtualmeter, headers, callback) {
            $http.post(getAPI()+'virtualmeters/'+virtualmeter.id+'/clone', {data:null}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
    };
});
