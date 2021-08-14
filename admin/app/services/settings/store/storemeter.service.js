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
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        deletePair: function(storeID, meterID, metertype, callback) {
            $http.delete(getAPI()+'stores/'+storeID+'/'+metertype+'/'+meterID)
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getMetersByStoreID: function(id, metertype, callback) {
            $http.get(getAPI()+'stores/'+id+'/'+metertype)
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});
