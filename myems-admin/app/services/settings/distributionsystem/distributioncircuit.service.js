'use strict';
app.factory('DistributionCircuitService', function($http) {
    return {
        getAllDistributionCircuits: function(callback) {
            $http.get(getAPI()+'distributioncircuits')
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getDistributionCircuitsByDistributionSystemID: function(id, callback) {
            $http.get(getAPI()+'distributionsystems/'+id+'/distributioncircuits')
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        addDistributionCircuit: function(distributioncircuit, headers, callback) {
            $http.post(getAPI()+'/distributioncircuits',{data:distributioncircuit}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        editDistributionCircuit: function(distributioncircuit, headers, callback) {
            $http.put(getAPI()+'/distributioncircuits/'+distributioncircuit.id,{data:distributioncircuit}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        deleteDistributionCircuit: function(distributioncircuitID, headers, callback) {
            $http.delete(getAPI()+'/distributioncircuits/'+distributioncircuitID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
    };
});
