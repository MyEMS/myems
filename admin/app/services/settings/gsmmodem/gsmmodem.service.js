'use strict';
app.factory('GSMModemService', function($http) {
    return {
        getAllGSMModems:function(callback){
            $http.get(getAPI()+'gsmmodems')
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        searchGSMModems: function(query, callback) {
            $http.get(getAPI()+'gsmmodems', { params: { q: query } })
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        addGSMModem: function(gsmmodem, callback) {
            $http.post(getAPI()+'gsmmodems',{data:gsmmodem})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        editGSMModem: function(gsmmodem, callback) {
            $http.put(getAPI()+'gsmmodems/'+gsmmodem.id,{data:gsmmodem})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        deleteGSMModem: function(gsmmodem, callback) {
            $http.delete(getAPI()+'gsmmodems/'+gsmmodem.id)
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getGSMModem: function(id, callback) {
            $http.get(getAPI()+'gsmmodems/'+id)
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});
