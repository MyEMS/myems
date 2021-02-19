'use strict';
app.factory('VirtualMeterService', function($http) {
    return {
        getAllVirtualMeters:function(callback){
            $http.get(getAPI()+'virtualmeters')
                .success(function (response, status, headers, config) {
                    callback(null, response);
                })
                .error(function (e,status) {
                    callback(e,status);
                });
        },
        searchVirtualMeters: function(query, callback) {
            $http.get(getAPI()+'virtualmeters', { params: { q: query } })
                .success(function (response, status, headers, config) {
                    callback(null, response);
                })
                .error(function (e,status) {
                    callback(e,status);
                });
        },
        addVirtualMeter: function(virtualmeter, callback) {
            $http.post(getAPI()+'virtualmeters',{data:virtualmeter})
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e,status) {
                    callback(e,status);
                });
        },
        editVirtualMeter: function(virtualmeter, callback) {
            $http.put(getAPI()+'virtualmeters/'+virtualmeter.id,{data:virtualmeter})
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e,status) {
                    callback(e,status);
                });
        },
        deleteVirtualMeter: function(virtualmeter, callback) {
            $http.delete(getAPI()+'virtualmeters/'+virtualmeter.id)
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e,status) {
                    callback(e,status);
                });
        }
    };
});
