'use strict';
app.factory('CostCenterTariffService', function($http) {  
    return {  
        addPair: function(costcenterid,tariffid,callback) {  
            $http.post(getAPI()+'costcenters/'+costcenterid+'/tariffs',{data:{'tariff_id':tariffid}})  
                .success(function (response, status, headers, config) {  
                    callback(null, status);  
                })  
                .error(function (e) {  
                    callback(e);  
                });  
        },
        
        deletePair: function(costcenterid,tariffid, callback) {  
            $http.delete(getAPI()+'costcenters/'+costcenterid+'/tariffs/'+tariffid)  
                .success(function (response, status, headers, config) {  
                    callback(null, status);  
                })  
                .error(function (e) {  
                    callback(e);  
                });  
        },
        getTariffsByCostCenterID: function(id, callback) {  
            $http.get(getAPI()+'costcenters/'+id+'/tariffs')  
                .success(function (response, status, headers, config) {  
                    callback(null, response);  
                })  
                .error(function (e) {  
                    callback(e);  
                });  
        }
    };
});  