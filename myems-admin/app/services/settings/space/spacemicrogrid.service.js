'use strict';

// Space Microgrid service - REST API wrapper
app.factory('SpaceMicrogridService', function($http) {
    return {
        // POST create pair
        addPair: function(spaceID, microgridID, headers, callback) {
            $http.post(getAPI() + 'spaces/' + spaceID + '/microgrids', { data: { 'microgrid_id': microgridID } }, { headers })
            .then(function(response) {
                callback(response);
            }, function(response) {
                callback(response);
            });
        },

        // DELETE pair
        deletePair: function(spaceID, microgridID, headers, callback) {
            $http.delete(getAPI() + 'spaces/' + spaceID + '/microgrids/' + microgridID, { headers })
            .then(function(response) {
                callback(response);
            }, function(response) {
                callback(response);
            });
        },

        // GET microgrids by space id by ID
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
