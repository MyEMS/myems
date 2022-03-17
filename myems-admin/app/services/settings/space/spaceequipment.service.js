'use strict';
app.factory('SpaceEquipmentService', function($http) {
    return {
        addPair: function(spaceID,equipmentID, headers, callback) {
            $http.post(getAPI()+'spaces/'+spaceID+'/equipments',{data:{'equipment_id':equipmentID}}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        deletePair: function(spaceID, equipmentID, headers, callback) {
            $http.delete(getAPI()+'spaces/'+spaceID+'/equipments/'+equipmentID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getEquipmentsBySpaceID: function(id, callback) {
            $http.get(getAPI()+'spaces/'+id+'/equipments')
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});
