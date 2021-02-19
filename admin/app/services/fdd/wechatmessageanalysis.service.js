'use strict';
app.factory('WechatMessageAnalysisService', function($http) {
    return {

        getAnalysisResult: function(query,callback) {
            var base="wechatmessages";
            var url=base+"/from/"+query.datestart+"/to/"+query.dateend;
            $http.get(getAPI()+url)
                .success(function (response, status, headers, config) {
                    callback(null, response);
                })
                .error(function (e) {
                    callback(e);
                });
        },

        deleteWechatMessage: function(wechatmessage, callback) {
            $http.delete(getAPI()+'wechatmessages/'+wechatmessage.id)
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e) {
                    callback(e);
                });
        }

    };
});
