'use strict';
app.factory('EnergyFlowDiagramService', function($http) {
    return {
        getAllEnergyFlowDiagrams:function(callback){
            $http.get(getAPI()+'energyflowdiagrams')
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        searchEnergyFlowDiagrams: function(query, callback) {
            $http.get(getAPI()+'energyflowdiagrams', { params: { q: query } })
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        addEnergyFlowDiagram: function(energyflowdiagram, callback) {
            $http.post(getAPI()+'energyflowdiagrams',{data:energyflowdiagram})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        editEnergyFlowDiagram: function(energyflowdiagram, callback) {
            $http.put(getAPI()+'energyflowdiagrams/'+energyflowdiagram.id,{data:energyflowdiagram})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        deleteEnergyFlowDiagram: function(energyflowdiagram, callback) {
            $http.delete(getAPI()+'energyflowdiagrams/'+energyflowdiagram.id)
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getEnergyFlowDiagram: function(id, callback) {
            $http.get(getAPI()+'energyflowdiagrams/'+id)
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});
