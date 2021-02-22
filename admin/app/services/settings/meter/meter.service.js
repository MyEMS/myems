'use strict';
app.factory('MeterService', function($http) {
    return {
        getAllMeters:function(callback){
            $http.get(getAPI()+'meters')
                .success(function (response, status, headers, config) {
                    callback(null, response);
                })
                .error(function (e,status) {
                    callback(e,status);
                });
        },
        getMeterSubmeters:function(meterid, callback){
            $http.get(getAPI()+'meters/'+meterid+'/submeters')
                .success(function (response, status, headers, config) {
                    callback(null, response);
                })
                .error(function (e) {
                    callback(e);
                });
        },
        searchMeters: function(query, callback) {
            $http.get(getAPI()+'meters', { params: { q: query } })
                .success(function (response, status, headers, config) {
                    callback(null, response);
                })
                .error(function (e,status) {
                    callback(e,status);
                });
        },
        addMeter: function(meter, callback) {
            $http.post(getAPI()+'meters',{data:meter})
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e,status) {
                    callback(e,status);
                });
        },
        editMeter: function(meter, callback) {
            $http.put(getAPI()+'meters/'+meter.id,{data:meter})
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e,status) {
                    callback(e,status);
                });
        },
        deleteMeter: function(meter, callback) {
            $http.delete(getAPI()+'meters/'+meter.id)
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e,status) {
                    callback(e,status);
                });
        },
        getMeter: function(id, callback) {
            $http.get(getAPI()+'meters/'+id)
                .success(function (response, status, headers, config) {
                    callback(null, response);
                })
                .error(function (e,status) {
                    callback(e,status);
                });
        }
    };
});
