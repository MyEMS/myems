'use strict';
app.factory('TextMessageAnalysisService', function($http) {
    return {

        getAnalysisResult: function(query, callback) {
            var base="textmessages";
            var url=base+"/from/"+query.datestart+"/to/"+query.dateend;
            $http.get(getAPI()+url)
                .success(function (response, status, headers, config) {
                    callback(null, response);
                })
                .error(function (e) {
                    callback(e);
                });
        },

        deleteTextMessage: function(textmessage, callback) {
            $http.delete(getAPI()+'textmessages/'+textmessage.id)
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e) {
                    callback(e);
                });
        }

    };
});
