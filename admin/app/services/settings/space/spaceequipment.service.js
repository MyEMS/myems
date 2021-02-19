'use strict';
app.factory('SpaceEquipmentService', function($http) {
    return {
        addPair: function(spaceID,equipmentID,callback) {
            $http.post(getAPI()+'spaces/'+spaceID+'/equipments',{data:{'equipment_id':equipmentID}})
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e) {
                    callback(e);
                });
        },

        deletePair: function(spaceID, equipmentID, callback) {
            $http.delete(getAPI()+'spaces/'+spaceID+'/equipments/'+equipmentID)
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e) {
                    callback(e);
                });
        },
        getEquipmentsBySpaceID: function(id, callback) {
            $http.get(getAPI()+'spaces/'+id+'/equipments')
                .success(function (response, status, headers, config) {
                    callback(null, response);
                })
                .error(function (e) {
                    callback(e);
                });
        }
    };
});
