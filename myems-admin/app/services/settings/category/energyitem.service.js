'use strict';
app.factory('EnergyItemService', function($http) {
    return {
        getAllEnergyItems:function(callback){
            $http.get(getAPI()+'energyitems')
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        searchEnergyItems: function(query, callback) {
            $http.get(getAPI()+'energyitems', { params: { q: query } })
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        addEnergyItem: function(energyItem, headers, callback) {
            $http.post(getAPI()+'energyitems',{data:energyItem}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        editEnergyItem: function(energyItem, headers, callback) {
            $http.put(getAPI()+'energyitems/'+energyItem.id,{data:energyItem}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
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
