'use strict';
app.factory('MicrogridUserService', function($http) {
    return {
        addPair: function(microgridID,userID, headers, callback) {
            $http.post(getAPI()+'microgrids/'+microgridID+'/users',{data:{'user_id':userID}}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        deletePair: function(microgridID,userID, headers, callback) {
            $http.delete(getAPI()+'microgrids/'+microgridID+'/users/'+userID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getUsersByMicrogridID: function(id, headers, callback) {
            $http.get(getAPI()+'microgrids/'+id+'/users', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});
