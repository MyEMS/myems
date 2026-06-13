'use strict';

// Space Equipment service - REST API wrapper
app.factory('SpaceEquipmentService', function($http) {
    return {
        // POST create pair
        addPair: function(spaceID,equipmentID, headers, callback) {
            $http.post(getAPI()+'spaces/'+spaceID+'/equipments',{data:{'equipment_id':equipmentID}}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        // DELETE pair
        deletePair: function(spaceID, equipmentID, headers, callback) {
            $http.delete(getAPI()+'spaces/'+spaceID+'/equipments/'+equipmentID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // GET equipments by space id by ID
        getEquipmentsBySpaceID: function(id, headers, callback) {
            $http.get(getAPI()+'spaces/'+id+'/equipments', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});
