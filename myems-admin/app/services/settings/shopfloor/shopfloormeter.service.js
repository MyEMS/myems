'use strict';

// Shop Floor Meter service - REST API wrapper
app.factory('ShopfloorMeterService', function($http) {
    return {
        // POST create pair
        addPair: function(shopfloorID,meterID, metertype, headers, callback) {
            var meter={};
            if(metertype=='meters'){
                meter={'meter_id':meterID};
            }else if(metertype=='virtualmeters'){
                meter={"virtual_meter_id":meterID};
            }else{
                meter={'offline_meter_id':meterID};
            }

            $http.post(getAPI()+'shopfloors/'+shopfloorID+'/'+metertype,{data:meter}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        // DELETE pair
        deletePair: function(shopfloorID,meterID, metertype, headers, callback) {
            $http.delete(getAPI()+'shopfloors/'+shopfloorID+'/'+metertype+'/'+meterID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // GET meters by shopfloor id by ID
        getMetersByShopfloorID: function(id, headers, metertype, callback) {
            $http.get(getAPI()+'shopfloors/'+id+'/'+metertype, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});
