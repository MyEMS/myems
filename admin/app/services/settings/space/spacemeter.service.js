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
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e) {
                    callback(e);
                });
        },

        deletePair: function(spaceID,meterID, metertype, callback) {
            $http.delete(getAPI()+'spaces/'+spaceID+'/'+metertype+'/'+meterID)
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e) {
                    callback(e);
                });
        },
        getMetersBySpaceID: function(id, metertype, callback) {
            $http.get(getAPI()+'spaces/'+id+'/'+metertype)
                .success(function (response, status, headers, config) {
                    callback(null, response);
                })
                .error(function (e) {
                    callback(e);
                });
        }
    };
});
