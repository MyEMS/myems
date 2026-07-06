'use strict';

// Tenant Meter service - REST API wrapper
app.factory('TenantMeterService', function($http) {
    return {
        // POST create pair
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

        // DELETE pair
        deletePair: function(tenantID, meterID, metertype, headers, callback) {
            $http.delete(getAPI()+'tenants/'+tenantID+'/'+metertype+'/'+meterID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // GET meters by tenant id by ID
        getMetersByTenantID: function(id, metertype, headers, callback) {
            $http.get(getAPI()+'tenants/'+id+'/'+metertype, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        
        // GET tenants that a meter is bound to (RESTful style)
        checkMeterBinding: function(meterId, meterType, headers, callback) {
            $http.get(getAPI()+'meters/'+meterId+'/tenants', {
                params: {
                    type: meterType
                },
                headers: headers
            })
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});
