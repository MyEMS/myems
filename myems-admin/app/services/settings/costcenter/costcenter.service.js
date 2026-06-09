'use strict';

// Cost Center service - REST API wrapper
app.factory('CostCenterService', function($http) {
    return {
        // GET all cost centers
        getAllCostCenters:function(headers, callback){
            $http.get(getAPI()+'costcenters', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // Search cost centers by query
        searchCostCenters: function(query, headers, callback) {
            $http.get(getAPI()+'costcenters', { params: { q: query } }, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // POST create cost center
        addCostCenter: function(costcenter, headers, callback) {
            $http.post(getAPI()+'costcenters',{data:costcenter}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // PUT update cost center
        editCostCenter: function(costcenter, headers, callback) {
            $http.put(getAPI()+'costcenters/'+costcenter.id,{data:costcenter}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // DELETE cost center
        deleteCostCenter: function(costcenter, headers, callback) {
            $http.delete(getAPI()+'costcenters/'+costcenter.id, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});