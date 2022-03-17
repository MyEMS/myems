'use strict';
app.factory('TextMessageService', function($http) {
    return {
        getResult: function(query, headers, callback) {
            $http.get(getAPI()+"textmessages?" + 'startdatetime=' + query.startdatetime + '&enddatetime=' + query.enddatetime, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        deleteTextMessage: function(textmessage, headers, callback) {
            $http.delete(getAPI()+'textmessages/'+textmessage.id, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }

    };
});
