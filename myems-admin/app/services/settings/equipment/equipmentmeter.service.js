'use strict';

// Equipment Meter service - REST API wrapper
app.factory('EquipmentMeterService', function($http) {  
    return {  
        // POST create pair
        addPair: function(equipmentID, meterID, metertype, is_output, headers, callback) {
            var meter={};
            if(metertype=='meters'){
                meter={'meter_id':meterID,is_output:is_output};
            }else if(metertype=='virtualmeters'){
                meter={"virtual_meter_id":meterID,is_output:is_output};
            }else{
                meter={'offline_meter_id':meterID,is_output:is_output};
            }
            $http.post(getAPI()+'equipments/'+equipmentID+'/'+metertype,{data:meter}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            }); 
        },
        
        // DELETE pair
        deletePair: function(equipmentID,meterID,metertype, headers, callback) {
            $http.delete(getAPI()+'equipments/'+equipmentID+'/'+metertype+'/'+meterID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            }); 
        },
        // GET meters by equipment id by ID
        getMetersByEquipmentID: function(id,metertype, headers, callback) {
            $http.get(getAPI()+'equipments/'+id+'/'+ metertype, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            }); 
        },
        
        // GET equipments that a meter is bound to (RESTful style)
        checkMeterBinding: function(meterId, meterType, headers, callback) {
            $http.get(getAPI()+'meters/'+meterId+'/equipments', {
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