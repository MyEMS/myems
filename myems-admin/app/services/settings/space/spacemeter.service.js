'use strict';

// Space Meter service - REST API wrapper
app.factory('SpaceMeterService', function($http) {
    return {
        // POST create pair
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

        // DELETE pair
        deletePair: function(spaceID,meterID, metertype, headers, callback) {
            $http.delete(getAPI()+'spaces/'+spaceID+'/'+metertype+'/'+meterID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // GET meters by space id by ID
        getMetersBySpaceID: function(id, metertype, headers, callback) {
            $http.get(getAPI()+'spaces/'+id+'/'+metertype, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        
        // GET spaces that a meter is bound to (RESTful style)
        checkMeterBinding: function(meterId, meterType, headers, callback) {
            $http.get(getAPI()+'meters/'+meterId+'/spaces', {
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
