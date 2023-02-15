'use strict';
app.factory('WebMessageService', function($http) {
    return {
        getResult: function(query, headers, callback) {
            $http.get(getAPI()+"webmessages?status=" + query.status + "&priority=" + query.priority + 
            "&startdatetime=" + query.startdatetime + "&enddatetime=" + query.enddatetime, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        getStatusNewResult: function(headers, callback) {
            $http.get(getAPI()+"webmessagesnew", {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        editWebMessage: function(webmessage, headers, callback) {
            $http.put(getAPI()+'webmessages/'+webmessage.id, {data:webmessage}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        deleteWebMessage: function(webmessage, headers, callback) {
            $http.delete(getAPI()+'webmessages/'+webmessage.id, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        markAllWebMessageAsRead: function(webmessage, headers, callback) {
            $http.put(getAPI()+'webmessagesnew', {data:webmessage}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
    };
});
