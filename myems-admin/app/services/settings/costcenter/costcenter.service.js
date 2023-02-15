'use strict';
app.factory('CostCenterService', function($http) {  
    return {  
        getAllCostCenters:function(callback){
            $http.get(getAPI()+'costcenters')  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        searchCostCenters: function(query, callback) {  
            $http.get(getAPI()+'costcenters', { params: { q: query } })  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });  
        },
        addCostCenter: function(costcenter, headers, callback) {
            $http.post(getAPI()+'costcenters',{data:costcenter}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        editCostCenter: function(costcenter, headers, callback) {
            $http.put(getAPI()+'costcenters/'+costcenter.id,{data:costcenter}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        deleteCostCenter: function(costcenter, headers, callback) {
            $http.delete(getAPI()+'costcenters/'+costcenter.id, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getCostCenter: function(id, callback) {  
            $http.get(getAPI()+'costcenters/'+id)  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});  