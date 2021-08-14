'use strict';
app.factory('SpaceMeterService', function($http) {
    return {
        addPair: function(spaceID,meterID, metertype,callback) {
            var meter={};
            if(metertype=='meters'){
                meter={'meter_id':meterID};
            }else if(metertype=='virtualmeters'){
                meter={"virtual_meter_id":meterID};
            }else{
                meter={'offline_meter_id':meterID};
            }

            $http.post(getAPI()+'spaces/'+spaceID+'/'+metertype,{data:meter})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        deletePair: function(spaceID,meterID, metertype, callback) {
            $http.delete(getAPI()+'spaces/'+spaceID+'/'+metertype+'/'+meterID)
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getMetersBySpaceID: function(id, metertype, callback) {
            $http.get(getAPI()+'spaces/'+id+'/'+metertype)
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});
