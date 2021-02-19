'use strict';
app.factory('GSMModemService', function($http) {
    return {
        getAllGSMModems:function(callback){
            $http.get(getAPI()+'gsmmodems')
                .success(function (response, status, headers, config) {
                    callback(null, response);
                })
                .error(function (e) {
                    callback(e);
                });
        },
        searchGSMModems: function(query, callback) {
            $http.get(getAPI()+'gsmmodems', { params: { q: query } })
                .success(function (response, status, headers, config) {
                    callback(null, response);
                })
                .error(function (e) {
                    callback(e);
                });
        },
        addGSMModem: function(gsmmodem, callback) {
            $http.post(getAPI()+'gsmmodems',{data:gsmmodem})
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e) {
                    callback(e);
                });
        },
        editGSMModem: function(gsmmodem, callback) {
            $http.put(getAPI()+'gsmmodems/'+gsmmodem.id,{data:gsmmodem})
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e) {
                    callback(e);
                });
        },
        deleteGSMModem: function(gsmmodem, callback) {
            $http.delete(getAPI()+'gsmmodems/'+gsmmodem.id)
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e) {
                    callback(e);
                });
        },
        getGSMModem: function(id, callback) {
            $http.get(getAPI()+'gsmmodems/'+id)
                .success(function (response, status, headers, config) {
                    callback(null, response);
                })
                .error(function (e) {
                    callback(e);
                });
        }
    };
});
