'use strict';
app.factory('EnergyStorageContainerUserService', function($http) {
    return {
        addPair: function(energystoragecontainerID,userID, headers, callback) {
            $http.post(getAPI()+'energystoragecontainers/'+energystoragecontainerID+'/users',{data:{'user_id':userID}}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        deletePair: function(energystoragecontainerID,userID, headers, callback) {
            $http.delete(getAPI()+'energystoragecontainers/'+energystoragecontainerID+'/users/'+userID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getUsersByEnergyStorageContainerID: function(id, headers, callback) {
            $http.get(getAPI()+'energystoragecontainers/'+id+'/users', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});
