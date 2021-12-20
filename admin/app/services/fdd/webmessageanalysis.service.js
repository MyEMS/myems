'use strict';
app.factory('WebMessageAnalysisService', function($http) {
    return {

        getAnalysisResult: function(query, headers, callback) {
            $http.get(getAPI()+"webmessages?" + "startdatetime=" + query.startdatetime + "&enddatetime=" + query.enddatetime, {headers})
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
        }

    };
});
