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
        addEnergyItem: function(energyItem, callback) {
            $http.post(getAPI()+'energyitems',{data:energyItem})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        editEnergyItem: function(energyItem, callback) {
            $http.put(getAPI()+'energyitems/'+energyItem.id,{data:energyItem})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        deleteEnergyItem: function(energyItem, callback) {
            $http.delete(getAPI()+'energyitems/'+energyItem.id)
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getEnergyItem: function(id, callback) {
            $http.get(getAPI()+'energyitems/'+id)
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});
