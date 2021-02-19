'use strict';
app.factory('ShopfloorMeterService', function($http) {
    return {
        addPair: function(shopfloorID,meterID, metertype,callback) {
            var meter={};
            if(metertype=='meters'){
                meter={'meter_id':meterID};
            }else if(metertype=='virtualmeters'){
                meter={"virtual_meter_id":meterID};
            }else{
                meter={'offline_meter_id':meterID};
            }

            $http.post(getAPI()+'shopfloors/'+shopfloorID+'/'+metertype,{data:meter})
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e) {
                    callback(e);
                });
        },

        deletePair: function(shopfloorID,meterID, metertype, callback) {
            $http.delete(getAPI()+'shopfloors/'+shopfloorID+'/'+metertype+'/'+meterID)
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e) {
                    callback(e);
                });
        },
        getMetersByShopfloorID: function(id, metertype, callback) {
            $http.get(getAPI()+'shopfloors/'+id+'/'+metertype)
                .success(function (response, status, headers, config) {
                    callback(null, response);
                })
                .error(function (e) {
                    callback(e);
                });
        }
    };
});
