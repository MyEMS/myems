'use strict';

// Cost Center Emission Factor service - REST API wrapper
app.factory('CostCenterEmissionFactorService', function($http) {
    return {
        // POST create pair
        addPair: function(costcenterid, emissionfactorid, headers, callback ) {
            $http.post(getAPI()+'costcenters/'+costcenterid+'/emissionfactors',{data:{'emission_factor_id':emissionfactorid}}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // DELETE pair
        deletePair: function(costcenterid, emissionfactorid, headers, callback) {
            $http.delete(getAPI()+'costcenters/'+costcenterid+'/emissionfactors/'+emissionfactorid, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // GET emission factors by cost center id
        getEmissionFactorsByCostCenterID: function(id, headers, callback) {
            $http.get(getAPI()+'costcenters/'+id+'/emissionfactors', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});