'use strict';
app.factory('TenantMeterService', function($http) {
    return {
        addPair: function(tenantID, meterID, metertype,callback) {
            var meter={};
            if(metertype=='meters'){
                meter={'meter_id':meterID};
            }else if(metertype=='virtualmeters'){
                meter={"virtual_meter_id":meterID};
            }else{
                meter={'offline_meter_id':meterID};
            }

            $http.post(getAPI()+'tenants/'+tenantID+'/'+metertype,{data:meter})
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e) {
                    callback(e);
                });
        },

        deletePair: function(tenantID, meterID, metertype, callback) {
            $http.delete(getAPI()+'tenants/'+tenantID+'/'+metertype+'/'+meterID)
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e) {
                    callback(e);
                });
        },
        getMetersByTenantID: function(id, metertype, callback) {
            $http.get(getAPI()+'tenants/'+id+'/'+metertype)
                .success(function (response, status, headers, config) {
                    callback(null, response);
                })
                .error(function (e) {
                    callback(e);
                });
        }
    };
});
