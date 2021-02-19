'use strict';
app.factory('EnergyFlowDiagramService', function($http) {
    return {
        getAllEnergyFlowDiagrams:function(callback){
            $http.get(getAPI()+'energyflowdiagrams')
                .success(function (response, status, headers, config) {
                    callback(null, response);
                })
                .error(function (e,status) {
                    callback(e,status);
                });
        },
        searchEnergyFlowDiagrams: function(query, callback) {
            $http.get(getAPI()+'energyflowdiagrams', { params: { q: query } })
                .success(function (response, status, headers, config) {
                    callback(null, response);
                })
                .error(function (e,status) {
                    callback(e,status);
                });
        },
        addEnergyFlowDiagram: function(energyflowdiagram, callback) {
            $http.post(getAPI()+'energyflowdiagrams',{data:energyflowdiagram})
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e,status) {
                    callback(e,status);
                });
        },
        editEnergyFlowDiagram: function(energyflowdiagram, callback) {
            $http.put(getAPI()+'energyflowdiagrams/'+energyflowdiagram.id,{data:energyflowdiagram})
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e,status) {
                    callback(e,status);
                });
        },
        deleteEnergyFlowDiagram: function(energyflowdiagram, callback) {
            $http.delete(getAPI()+'energyflowdiagrams/'+energyflowdiagram.id)
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e,status) {
                    callback(e,status);
                });
        },
        getEnergyFlowDiagram: function(id, callback) {
            $http.get(getAPI()+'energyflowdiagrams/'+id)
                .success(function (response, status, headers, config) {
                    callback(null, response);
                })
                .error(function (e,status) {
                    callback(e,status);
                });
        }
    };
});
