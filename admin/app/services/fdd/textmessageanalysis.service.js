'use strict';
app.factory('TextMessageAnalysisService', function($http) {
    return {

        getAnalysisResult: function(query, callback) {
            var base="textmessages";
            var url=base+"/from/"+query.datestart+"/to/"+query.dateend;
            $http.get(getAPI()+url)
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        deleteTextMessage: function(textmessage, callback) {
            $http.delete(getAPI()+'textmessages/'+textmessage.id)
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }

    };
});
