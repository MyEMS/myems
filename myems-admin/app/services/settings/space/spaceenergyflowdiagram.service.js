'use strict';

// Space Energy Flow Diagram service - REST API wrapper
app.factory('SpaceEnergyFlowDiagramService', function($http) {
    return {
        // POST create pair
        addPair: function(spaceID,energyflowdiagramID, headers, callback) {
            $http.post(getAPI()+'spaces/'+spaceID+'/energyflowdiagrams',{data:{'energy_flow_diagram_id':energyflowdiagramID}}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        // DELETE pair
        deletePair: function(spaceID, energyflowdiagramID, headers, callback) {
            $http.delete(getAPI()+'spaces/'+spaceID+'/energyflowdiagrams/'+energyflowdiagramID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // GET energy flow diagrams by space id by ID
        getEnergyFlowDiagramsBySpaceID: function(id, headers, callback) {
            $http.get(getAPI()+'spaces/'+id+'/energyflowdiagrams', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});
