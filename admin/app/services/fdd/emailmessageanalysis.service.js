'use strict';
app.factory('EmailMessageAnalysisService', function($http) {
    return {

        getAnalysisResult: function(query,callback) {
            var base="emailmessages";
            var url=base+"/from/"+query.datestart+"/to/"+query.dateend;
            $http.get(getAPI()+url)
                .success(function (response, status, headers, config) {
                    callback(null, response);
                })
                .error(function (e) {
                    callback(e);
                });
        },

        deleteEmailMessage: function(emailmessage, callback) {
            $http.delete(getAPI()+'eamilmessages/'+emailmessage.id)
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e) {
                    callback(e);
                });
        }

    };
});
