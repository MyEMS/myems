'use strict';
app.factory('CostCenterTariffService', function($http) {  
    return {  
        addPair: function(costcenterid, tariffid, headers, callback ) {
            $http.post(getAPI()+'costcenters/'+costcenterid+'/tariffs',{data:{'tariff_id':tariffid}}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            }); 
        },
        
        deletePair: function(costcenterid, tariffid, headers, callback) {
            $http.delete(getAPI()+'costcenters/'+costcenterid+'/tariffs/'+tariffid, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            }); 
        },
        getTariffsByCostCenterID: function(id, callback) {  
            $http.get(getAPI()+'costcenters/'+id+'/tariffs')
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            }); 
        }
    };
});  