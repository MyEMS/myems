'use strict';

// Energy Flow Diagram service - REST API wrapper
app.factory('EnergyFlowDiagramService', function($http) {
    return {
        // GET all energy flow diagrams
        getAllEnergyFlowDiagrams:function(headers, callback){
            $http.get(getAPI()+'energyflowdiagrams', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // Search energy flow diagrams by query
        searchEnergyFlowDiagrams: function(query, headers, callback) {
            $http.get(getAPI()+'energyflowdiagrams', {
                params: {q: query},
                headers: headers
            })
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // POST create energy flow diagram
        addEnergyFlowDiagram: function(energyflowdiagram, headers, callback) {
            $http.post(getAPI()+'energyflowdiagrams',{data:energyflowdiagram}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // PUT update energy flow diagram
        editEnergyFlowDiagram: function(energyflowdiagram, headers, callback) {
            $http.put(getAPI()+'energyflowdiagrams/'+energyflowdiagram.id,{data:energyflowdiagram}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // DELETE energy flow diagram
        deleteEnergyFlowDiagram: function(energyflowdiagram, headers, callback) {
            $http.delete(getAPI()+'energyflowdiagrams/'+energyflowdiagram.id, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // GET export energy flow diagram
        exportEnergyFlowDiagram: function(energyflowdiagram, headers, callback) {
            $http.get(getAPI()+'energyflowdiagrams/'+energyflowdiagram.id+'/export', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // POST import energy flow diagram
        importEnergyFlowDiagram: function(importdata, headers, callback) {
            $http.post(getAPI()+'energyflowdiagrams/import', JSON.parse(importdata), {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // POST clone energy flow diagram
        cloneEnergyFlowDiagram: function(energyflowdiagram, headers, callback) {
            $http.post(getAPI()+'energyflowdiagrams/'+energyflowdiagram.id+'/clone', {data:null}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
    };
});
