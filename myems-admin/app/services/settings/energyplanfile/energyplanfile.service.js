'use strict';
app.factory('EnergyPlanFileService', function($http) {  
    return {  
        getAllEnergyPlanFiles:function(headers, callback){
            $http.get(getAPI()+'energyplanfiles', {headers})  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        searchEnergyPlanFiles: function(query, headers, callback) {  
            $http.get(getAPI()+'energyplanfiles', { params: { q: query } }, {headers})  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            }); 
        },
        addEnergyPlanFile: function(EnergyPlanfile, headers, callback) {  
            $http.post(getAPI()+'energyplanfiles', {data:EnergyPlanfile}, {headers})  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });  
        },
        restoreEnergyPlanFile: function (EnergyPlanfile, headers, callback) {
            $http.get(getAPI() + 'energyplanfiles/' + EnergyPlanfile.id + '/restore', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        deleteEnergyPlanFile: function(EnergyPlanfile, headers, callback) {  
            $http.delete(getAPI()+'energyplanfiles/' + EnergyPlanfile.id, {headers})  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            }); 
        },
        getEnergyPlanFile: function(id, headers, callback) {  
            $http.get(getAPI()+'energyplanfiles/' + id, {headers})  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            }); 
        }
    };
});  