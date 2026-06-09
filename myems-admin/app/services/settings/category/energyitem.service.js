'use strict';

// Energy Item service - REST API wrapper
app.factory('EnergyItemService', function($http) {
    return {
        // GET all energy items
        getAllEnergyItems:function(headers, callback){
            $http.get(getAPI()+'energyitems', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // Search energy items by query
        searchEnergyItems: function(query, callback) {
            $http.get(getAPI()+'energyitems', { params: { q: query } })
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // POST create energy item
        addEnergyItem: function(energyItem, headers, callback) {
            $http.post(getAPI()+'energyitems',{data:energyItem}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // PUT update energy item
        editEnergyItem: function(energyItem, headers, callback) {
            $http.put(getAPI()+'energyitems/'+energyItem.id,{data:energyItem}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // DELETE energy item
        deleteEnergyItem: function(energyItem, headers, callback) {
            $http.delete(getAPI()+'energyitems/'+energyItem.id, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});
