'use strict';
app.factory('WebMessageAnalysisService', function($http) {
    return {

        getAnalysisResult: function(query,callback) {
            var base="webmessages";
            var url=base+"/from/"+query.datestart+"/to/"+query.dateend;
            $http.get(getAPI()+url)
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        getStatusNewResult: function(callback) {
            var base="webmessagesnew";
            $http.get(getAPI()+base)
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        editWebMessage: function(webmessage, callback) {
            $http.put(getAPI()+'webmessages/'+webmessage.id, {data:webmessage})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        deleteWebMessage: function(webmessage, callback) {
            $http.delete(getAPI()+'webmessages/'+webmessage.id)
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }

    };
});
