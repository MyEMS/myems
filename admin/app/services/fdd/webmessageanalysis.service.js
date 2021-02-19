'use strict';
app.factory('WebMessageAnalysisService', function($http) {
    return {

        getAnalysisResult: function(query,callback) {
            var base="webmessages";
            var url=base+"/from/"+query.datestart+"/to/"+query.dateend;
            $http.get(getAPI()+url)
                .success(function (response, status, headers, config) {
                    callback(null, response);
                })
                .error(function (e) {
                    callback(e);
                });
        },

        getStatusNewResult: function(callback) {
            var base="webmessagesnew";
            $http.get(getAPI()+base)
                .success(function (response, status, headers, config) {
                    callback(null, response);
                })
                .error(function (e) {
                    callback(e);
                });
        },

        editWebMessage: function(webmessage, callback) {
            $http.put(getAPI()+'webmessages/'+webmessage.id, {data:webmessage})
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e) {
                    callback(e);
                });
        },

        deleteWebMessage: function(webmessage, callback) {
            $http.delete(getAPI()+'webmessages/'+webmessage.id)
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e) {
                    callback(e);
                });
        }

    };
});
