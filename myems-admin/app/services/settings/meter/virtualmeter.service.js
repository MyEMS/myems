'use strict';

// Virtual Meter service - REST API wrapper
app.factory('VirtualMeterService', function($http) {
    return {
        // GET all virtual meters
        getAllVirtualMeters:function(headers, callback){
            $http.get(getAPI()+'virtualmeters', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // Search virtual meters by query
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
        // POST create virtual meter
        addVirtualMeter: function(virtualmeter, headers, callback) {
            $http.post(getAPI()+'virtualmeters',{data:virtualmeter}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // PUT update virtual meter
        editVirtualMeter: function(virtualmeter, headers, callback) {
            $http.put(getAPI()+'virtualmeters/'+virtualmeter.id,{data:virtualmeter}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // DELETE virtual meter
        deleteVirtualMeter: function(virtualmeter, headers, callback) {
            $http.delete(getAPI()+'virtualmeters/'+virtualmeter.id, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // GET export virtual meter
        exportVirtualMeter: function(virtualmeter, headers, callback) {
            $http.get(getAPI()+'virtualmeters/'+virtualmeter.id+'/export', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // POST import virtual meter
        importVirtualMeter: function(importdata, headers, callback) {
            $http.post(getAPI()+'virtualmeters/import', JSON.parse(importdata), {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // POST clone virtual meter
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
