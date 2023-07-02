'use strict';
app.factory('EnergyFlowDiagramService', function($http) {
    return {
        getAllEnergyFlowDiagrams:function(headers, callback){
            $http.get(getAPI()+'energyflowdiagrams', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        searchEnergyFlowDiagrams: function(query, headers, callback) {
            $http.get(getAPI()+'energyflowdiagrams', { params: { q: query } }, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        addEnergyFlowDiagram: function(energyflowdiagram, headers, callback) {
            $http.post(getAPI()+'energyflowdiagrams',{data:energyflowdiagram}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        editEnergyFlowDiagram: function(energyflowdiagram, headers, callback) {
            $http.put(getAPI()+'energyflowdiagrams/'+energyflowdiagram.id,{data:energyflowdiagram}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        deleteEnergyFlowDiagram: function(energyflowdiagram, headers, callback) {
            $http.delete(getAPI()+'energyflowdiagrams/'+energyflowdiagram.id, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});
