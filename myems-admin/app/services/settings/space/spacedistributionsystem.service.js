'use strict';
app.factory('SpaceDistributionSystemService', function($http) {
    return {
        addPair: function(spaceID,distributionsystemID, headers, callback) {
            $http.post(getAPI()+'spaces/'+spaceID+'/distributionsystems',{data:{'distribution_system_id':distributionsystemID}}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        deletePair: function(spaceID, distributionsystemID, headers, callback) {
            $http.delete(getAPI()+'spaces/'+spaceID+'/distributionsystems/'+distributionsystemID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
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
