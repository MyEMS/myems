'use strict';

// Cost Center Tariff service - REST API wrapper
app.factory('CostCenterTariffService', function($http) {
    return {
        // POST create pair
        addPair: function(costcenterid, tariffid, headers, callback ) {
            $http.post(getAPI()+'costcenters/'+costcenterid+'/tariffs',{data:{'tariff_id':tariffid}}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // DELETE pair
        deletePair: function(costcenterid, tariffid, headers, callback) {
            $http.delete(getAPI()+'costcenters/'+costcenterid+'/tariffs/'+tariffid, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // GET tariffs by cost center id by ID
        getTariffsByCostCenterID: function(id, headers, callback) {
            $http.get(getAPI()+'costcenters/'+id+'/tariffs', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});