'use strict';
app.factory('EnergyItemService', function($http) {
    return {
        getAllEnergyItems:function(callback){
            $http.get(getAPI()+'energyitems')
                .success(function (response, status, headers, config) {
                    callback(null, response);
                })
                .error(function (e) {
                    callback(e);
                });
        },
        searchEnergyItems: function(query, callback) {
            $http.get(getAPI()+'energyitems', { params: { q: query } })
                .success(function (response, status, headers, config) {
                    callback(null, response);
                })
                .error(function (e) {
                    callback(e);
                });
        },
        addEnergyItem: function(energyItem, callback) {
            $http.post(getAPI()+'energyitems',{data:energyItem})
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e) {
                    callback(e);
                });
        },
        editEnergyItem: function(energyItem, callback) {
            $http.put(getAPI()+'energyitems/'+energyItem.id,{data:energyItem})
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e) {
                    callback(e);
                });
        },
        deleteEnergyItem: function(energyItem, callback) {
            $http.delete(getAPI()+'energyitems/'+energyItem.id)
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e) {
                    callback(e);
                });
        },
        getEnergyItem: function(id, callback) {
            $http.get(getAPI()+'energyitems/'+id)
                .success(function (response, status, headers, config) {
                    callback(null, response);
                })
                .error(function (e) {
                    callback(e);
                });
        }
    };
});
