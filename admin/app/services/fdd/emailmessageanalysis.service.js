'use strict';
app.factory('EmailMessageAnalysisService', function($http) {
    return {

        getAnalysisResult: function(query,callback) {
            var base="emailmessages";
            var url=base+"/from/"+query.datestart+"/to/"+query.dateend;
            $http.get(getAPI()+url)
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        deleteEmailMessage: function(emailmessage, callback) {
            $http.delete(getAPI()+'emailmessages/'+emailmessage.id)
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }

    };
});
