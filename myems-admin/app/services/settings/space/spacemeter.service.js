'use strict';
app.factory('SpaceMeterService', function($http) {
    return {
        addPair: function(spaceID,meterID, metertype, headers, callback) {
            var meter={};
            if(metertype=='meters'){
                meter={'meter_id':meterID};
            }else if(metertype=='virtualmeters'){
                meter={"virtual_meter_id":meterID};
            }else{
                meter={'offline_meter_id':meterID};
            }

            $http.post(getAPI()+'spaces/'+spaceID+'/'+metertype,{data:meter}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        deletePair: function(spaceID,meterID, metertype, headers, callback) {
            $http.delete(getAPI()+'spaces/'+spaceID+'/'+metertype+'/'+meterID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getMetersBySpaceID: function(id, metertype, headers, callback) {
            $http.get(getAPI()+'spaces/'+id+'/'+metertype, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});
