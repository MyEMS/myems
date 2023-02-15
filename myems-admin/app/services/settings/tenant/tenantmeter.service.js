'use strict';
app.factory('TenantMeterService', function($http) {
    return {
        addPair: function(tenantID, meterID, metertype, headers, callback) {
            var meter={};
            if(metertype=='meters'){
                meter={'meter_id':meterID};
            }else if(metertype=='virtualmeters'){
                meter={"virtual_meter_id":meterID};
            }else{
                meter={'offline_meter_id':meterID};
            }

            $http.post(getAPI()+'tenants/'+tenantID+'/'+metertype,{data:meter}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        deletePair: function(tenantID, meterID, metertype, headers, callback) {
            $http.delete(getAPI()+'tenants/'+tenantID+'/'+metertype+'/'+meterID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getMetersByTenantID: function(id, metertype, callback) {
            $http.get(getAPI()+'tenants/'+id+'/'+metertype)
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});
