'use strict';
app.factory('SpaceEquipmentService', function($http) {
    return {
        addPair: function(spaceID,equipmentID,callback) {
            $http.post(getAPI()+'spaces/'+spaceID+'/equipments',{data:{'equipment_id':equipmentID}})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        deletePair: function(spaceID, equipmentID, callback) {
            $http.delete(getAPI()+'spaces/'+spaceID+'/equipments/'+equipmentID)
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
