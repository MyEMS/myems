'use strict';

// Microgrid User service - REST API wrapper
app.factory('MicrogridUserService', function($http) {
    return {
        // POST create pair
        addPair: function(microgridID,userID, headers, callback) {
            $http.post(getAPI()+'microgrids/'+microgridID+'/users',{data:{'user_id':userID}}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        // DELETE pair
        deletePair: function(microgridID,userID, headers, callback) {
            $http.delete(getAPI()+'microgrids/'+microgridID+'/users/'+userID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // GET users by microgrid id by ID
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
