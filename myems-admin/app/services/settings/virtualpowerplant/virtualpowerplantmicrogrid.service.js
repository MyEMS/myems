'use strict';
app.factory('VirtualPowerPlantMicrogridService', function($http) {
    return {
        addPair: function(virtualpowerplantID,microgridID, headers, callback) {
            $http.post(getAPI()+'virtualpowerplants/'+virtualpowerplantID+'/microgrids',{data:{'microgrid_id':microgridID}}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        deletePair: function(virtualpowerplantID,microgridID, headers, callback) {
            $http.delete(getAPI()+'virtualpowerplants/'+virtualpowerplantID+'/microgrids/'+microgridID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
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
