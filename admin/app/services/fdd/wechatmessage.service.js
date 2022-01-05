'use strict';
app.factory('WechatMessageService', function($http) {
    return {
        getResult: function(query, headers, callback) {
            $http.get(getAPI()+"wechatmessages?" + 'startdatetime=' + query.startdatetime + '&enddatetime=' + query.enddatetime, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        deleteWechatMessage: function(wechatmessage, headers, callback) {
            $http.delete(getAPI()+'wechatmessages/'+wechatmessage.id, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }

    };
});
