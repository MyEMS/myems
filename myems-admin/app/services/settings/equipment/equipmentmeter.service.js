'use strict';
app.factory('EquipmentMeterService', function($http) {  
    return {  
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
        
        deletePair: function(equipmentID,meterID,metertype, headers, callback) {
            $http.delete(getAPI()+'equipments/'+equipmentID+'/'+metertype+'/'+meterID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            }); 
        },
        getMetersByEquipmentID: function(id,metertype, headers, callback) {
            $http.get(getAPI()+'equipments/'+id+'/'+ metertype, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            }); 
        }
    };
});  