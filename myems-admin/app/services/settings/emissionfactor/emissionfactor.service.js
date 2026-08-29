'use strict';

// Emission Factor service - REST API wrapper
app.factory('EmissionFactorService', function($http) {
    return {
        // GET all emission factors
        getAllEmissionFactors:function(headers, callback){
            $http.get(getAPI()+'emissionfactors', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // Search emission factors by query
        searchEmissionFactors: function(query, headers, callback) {
            $http.get(getAPI()+'emissionfactors', {
                params: {q: query},
                headers: headers
            })
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // POST create emission factor
        addEmissionFactor: function(emissionfactor, headers, callback) {
            $http.post(getAPI()+'emissionfactors',{data:emissionfactor}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // PUT update emission factor
        editEmissionFactor: function(emissionfactor, headers, callback) {
            $http.put(getAPI()+'emissionfactors/'+emissionfactor.id,{data:emissionfactor}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // DELETE emission factor
        deleteEmissionFactor: function(emissionfactor, headers, callback) {
            $http.delete(getAPI()+'emissionfactors/'+emissionfactor.id, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // GET export emission factor
        exportEmissionFactor: function(emissionfactor, headers, callback) {
            $http.get(getAPI()+'emissionfactors/'+emissionfactor.id+'/export', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // POST import emission factor
        importEmissionFactor: function(importdata, headers, callback) {
            $http.post(getAPI()+'emissionfactors/import', JSON.parse(importdata), {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // POST clone emission factor
        cloneEmissionFactor: function(emissionfactor, headers, callback) {
            $http.post(getAPI()+'emissionfactors/'+emissionfactor.id+'/clone', {data:null}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
    };
});