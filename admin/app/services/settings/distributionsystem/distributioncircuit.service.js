'use strict';
app.factory('DistributionCircuitService', function($http) {
    return {
        getAllDistributionCircuits: function(callback) {
            $http.get(getAPI()+'distributioncircuits')
                .success(function (response, status, headers, config) {
                    callback(null, response);
                })
                .error(function (e) {
                    callback(e);
                });
        },
        getDistributionCircuitsByDistributionSystemID: function(id, callback) {
            $http.get(getAPI()+'distributionsystems/'+id+'/distributioncircuits')
                .success(function (response, status, headers, config) {
                    callback(null, response);
                })
                .error(function (e) {
                    callback(e);
                });
        },
        addDistributionCircuit: function(distributioncircuit,callback) {
            $http.post(getAPI()+'/distributioncircuits',{data:distributioncircuit})
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e) {
                    callback(e);
                });
        },
        editDistributionCircuit: function(distributioncircuit,callback) {
            $http.put(getAPI()+'/distributioncircuits/'+distributioncircuit.id,{data:distributioncircuit})
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e) {
                    callback(e);
                });
        },

        deleteDistributionCircuit: function(distributioncircuitID, callback) {
            $http.delete(getAPI()+'/distributioncircuits/'+distributioncircuitID)
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e) {
                    callback(e);
                });
        },
    };
});
