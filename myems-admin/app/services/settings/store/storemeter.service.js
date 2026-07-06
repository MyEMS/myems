'use strict';

// Store Meter service - REST API wrapper
app.factory('StoreMeterService', function($http) {
    return {
        // POST create pair
        addPair: function(storeID, meterID, metertype, headers, callback) {
            var meter={};
            if(metertype=='meters'){
                meter={'meter_id':meterID};
            }else if(metertype=='virtualmeters'){
                meter={"virtual_meter_id":meterID};
            }else{
                meter={'offline_meter_id':meterID};
            }

            $http.post(getAPI()+'stores/'+storeID+'/'+metertype,{data:meter}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        // DELETE pair
        deletePair: function(storeID, meterID, metertype, headers, callback) {
            $http.delete(getAPI()+'stores/'+storeID+'/'+metertype+'/'+meterID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // GET meters by store id by ID
        getMetersByStoreID: function(id, metertype, headers, callback) {
            $http.get(getAPI()+'stores/'+id+'/'+metertype, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        
        // GET stores that a meter is bound to (RESTful style)
        checkMeterBinding: function(meterId, meterType, headers, callback) {
            $http.get(getAPI()+'meters/'+meterId+'/stores', {
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
