'use strict';

// Virtual Power Plant Microgrid service - REST API wrapper
app.factory('VirtualPowerPlantMicrogridService', function($http) {
    return {
        // POST create pair
        addPair: function(virtualpowerplantID,microgridID, headers, callback) {
            $http.post(getAPI()+'virtualpowerplants/'+virtualpowerplantID+'/microgrids',{data:{'microgrid_id':microgridID}}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        // DELETE pair
        deletePair: function(virtualpowerplantID,microgridID, headers, callback) {
            $http.delete(getAPI()+'virtualpowerplants/'+virtualpowerplantID+'/microgrids/'+microgridID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // GET microgrids by virtual power plant id by ID
        getMicrogridsByVirtualPowerPlantID: function(id, headers, callback) {
            $http.get(getAPI()+'virtualpowerplants/'+id+'/microgrids', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});
