'use strict';
app.factory('SpaceEnergyFlowDiagramService', function($http) {
    return {
        addPair: function(spaceID,energyflowdiagramID, headers, callback) {
            $http.post(getAPI()+'spaces/'+spaceID+'/energyflowdiagrams',{data:{'energyflowdiagram_id':energyflowdiagramID}}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        deletePair: function(spaceID, energyflowdiagramID, headers, callback) {
            $http.delete(getAPI()+'spaces/'+spaceID+'/energyflowdiagrams/'+energyflowdiagramID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
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
