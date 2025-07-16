'use strict';
app.factory('SpaceMicrogridService', function($http) {
    return {
        addPair: function(spaceID, microgridID, headers, callback) {
            $http.post(getAPI() + 'spaces/' + spaceID + '/microgrids', { data: { 'microgrid_id': microgridID } }, { headers })
            .then(function(response) {
                callback(response);
            }, function(response) {
                callback(response);
            });
        },

        deletePair: function(spaceID, microgridID, headers, callback) {
            $http.delete(getAPI() + 'spaces/' + spaceID + '/microgrids/' + microgridID, { headers })
            .then(function(response) {
                callback(response);
            }, function(response) {
                callback(response);
            });
        },

        getMicrogridsBySpaceID: function(id, headers, callback) {
            $http.get(getAPI() + 'spaces/' + id + '/microgrids', { headers })
            .then(function(response) {
                callback(response);
            }, function(response) {
                callback(response);
            });
        }
    };
});
