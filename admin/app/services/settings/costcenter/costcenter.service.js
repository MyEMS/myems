'use strict';
app.factory('CostCenterService', function($http) {  
    return {  
        getAllCostCenters:function(callback){
            $http.get(getAPI()+'costcenters')  
                .success(function (response, status, headers, config) {  
                    callback(null, response);  
                })  
                .error(function (e) {  
                    callback(e);  
                });
        },
        searchCostCenters: function(query, callback) {  
            $http.get(getAPI()+'costcenters', { params: { q: query } })  
                .success(function (response, status, headers, config) {  
                    callback(null, response);  
                })  
                .error(function (e) {  
                    callback(e);  
                });  
        },
        addCostCenter: function(costcenter, callback) {  
            $http.post(getAPI()+'costcenters',{data:costcenter})  
                .success(function (response, status, headers, config) {  
                    callback(null, status);  
                })  
                .error(function (e) {  
                    callback(e);  
                });  
        },
        editCostCenter: function(costcenter, callback) {  
            $http.put(getAPI()+'costcenters/'+costcenter.id,{data:costcenter})  
                .success(function (response, status, headers, config) {  
                    callback(null, status);  
                })  
                .error(function (e) {  
                    callback(e);  
                });  
        },
        deleteCostCenter: function(costcenter, callback) {  
            $http.delete(getAPI()+'costcenters/'+costcenter.id)  
                .success(function (response, status, headers, config) {  
                    callback(null, status);  
                })  
                .error(function (e,status) {  
                    callback(e,status);  
                });  
        },
        getCostCenter: function(id, callback) {  
            $http.get(getAPI()+'costcenters/'+id)  
                .success(function (response, status, headers, config) {  
                    callback(null, response);  
                })  
                .error(function (e) {  
                    callback(e);  
                });  
        }
    };
});  