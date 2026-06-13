'use strict';

// Distribution Circuit service - REST API wrapper
app.factory('DistributionCircuitService', function($http) {
    return {
        // GET all distribution circuits
        getAllDistributionCircuits: function(headers, callback) {
            $http.get(getAPI()+'distributioncircuits', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // GET distribution circuits by distribution system id by ID
        getDistributionCircuitsByDistributionSystemID: function(id, headers, callback) {
            $http.get(getAPI()+'distributionsystems/'+id+'/distributioncircuits', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // POST create distribution circuit
        addDistributionCircuit: function(distributioncircuit, headers, callback) {
            $http.post(getAPI()+'/distributioncircuits',{data:distributioncircuit}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // PUT update distribution circuit
        editDistributionCircuit: function(distributioncircuit, headers, callback) {
            $http.put(getAPI()+'/distributioncircuits/'+distributioncircuit.id,{data:distributioncircuit}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        // DELETE distribution circuit
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
