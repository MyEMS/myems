'use strict';
app.factory('CostCenterTariffService', function($http) {  
    return {  
        addPair: function(costcenterid,tariffid,callback) {  
            $http.post(getAPI()+'costcenters/'+costcenterid+'/tariffs',{data:{'tariff_id':tariffid}})  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            }); 
        },
        
        deletePair: function(costcenterid,tariffid, callback) {  
            $http.delete(getAPI()+'costcenters/'+costcenterid+'/tariffs/'+tariffid)  
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