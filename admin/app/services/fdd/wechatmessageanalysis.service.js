'use strict';
app.factory('WechatMessageAnalysisService', function($http) {
    return {

        getAnalysisResult: function(query,callback) {
            var base="wechatmessages";
            var url=base+"/from/"+query.datestart+"/to/"+query.dateend;
            $http.get(getAPI()+url)
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        deleteWechatMessage: function(wechatmessage, callback) {
            $http.delete(getAPI()+'wechatmessages/'+wechatmessage.id)
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }

    };
});
