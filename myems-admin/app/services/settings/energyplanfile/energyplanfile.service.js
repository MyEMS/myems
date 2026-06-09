'use strict';

// Energy Plan File service - REST API wrapper
app.factory('EnergyPlanFileService', function($http) {  
    return {  
        // GET all energy plan files
        getAllEnergyPlanFiles:function(headers, callback){
            $http.get(getAPI()+'energyplanfiles', {headers})  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // Search energy plan files by query
        searchEnergyPlanFiles: function(query, headers, callback) {  
            $http.get(getAPI()+'energyplanfiles', { params: { q: query } }, {headers})  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            }); 
        },
        // POST create energy plan file
        addEnergyPlanFile: function(EnergyPlanfile, headers, callback) {  
            $http.post(getAPI()+'energyplanfiles', {data:EnergyPlanfile}, {headers})  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });  
        },
        // API: restore energy plan file
        restoreEnergyPlanFile: function (EnergyPlanfile, headers, callback) {
            $http.get(getAPI() + 'energyplanfiles/' + EnergyPlanfile.id + '/restore', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // DELETE energy plan file
        deleteEnergyPlanFile: function(EnergyPlanfile, headers, callback) {  
            $http.delete(getAPI()+'energyplanfiles/' + EnergyPlanfile.id, {headers})  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            }); 
        },
        // GET energy plan file by ID
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