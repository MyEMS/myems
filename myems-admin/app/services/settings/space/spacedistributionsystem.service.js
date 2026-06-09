'use strict';

// Space Distribution System service - REST API wrapper
app.factory('SpaceDistributionSystemService', function($http) {
    return {
        // POST create pair
        addPair: function(spaceID,distributionsystemID, headers, callback) {
            $http.post(getAPI()+'spaces/'+spaceID+'/distributionsystems',{data:{'distribution_system_id':distributionsystemID}}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        // DELETE pair
        deletePair: function(spaceID, distributionsystemID, headers, callback) {
            $http.delete(getAPI()+'spaces/'+spaceID+'/distributionsystems/'+distributionsystemID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // GET distribution systems by space id by ID
        getDistributionSystemsBySpaceID: function(id, headers, callback) {
            $http.get(getAPI()+'spaces/'+id+'/distributionsystems', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});
