'use strict';
app.factory('StoreMeterService', function($http) {
    return {
        addPair: function(storeID, meterID, metertype,callback) {
            var meter={};
            if(metertype=='meters'){
                meter={'meter_id':meterID};
            }else if(metertype=='virtualmeters'){
                meter={"virtual_meter_id":meterID};
            }else{
                meter={'offline_meter_id':meterID};
            }

            $http.post(getAPI()+'stores/'+storeID+'/'+metertype,{data:meter})
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e) {
                    callback(e);
                });
        },

        deletePair: function(storeID, meterID, metertype, callback) {
            $http.delete(getAPI()+'stores/'+storeID+'/'+metertype+'/'+meterID)
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e) {
                    callback(e);
                });
        },
        getMetersByStoreID: function(id, metertype, callback) {
            $http.get(getAPI()+'stores/'+id+'/'+metertype)
                .success(function (response, status, headers, config) {
                    callback(null, response);
                })
                .error(function (e) {
                    callback(e);
                });
        }
    };
});
