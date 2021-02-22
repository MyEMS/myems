'use strict';
app.factory('EquipmentMeterService', function($http) {  
    return {  
        addPair: function(equipmentID,meterID,metertype,is_output,callback) {  
            var meter={};
            if(metertype=='meters'){
                meter={'meter_id':meterID,is_output:is_output};
            }else if(metertype=='virtualmeters'){
                meter={"virtual_meter_id":meterID,is_output:is_output};
            }else{
                meter={'offline_meter_id':meterID,is_output:is_output};
            }
            $http.post(getAPI()+'equipments/'+equipmentID+'/'+metertype,{data:meter})  
                .success(function (response, status, headers, config) {  
                    callback(null, status);  
                })  
                .error(function (e) {  
                    callback(e);  
                });  
        },
        
        deletePair: function(equipmentID,meterID,metertype, callback) {  
            $http.delete(getAPI()+'equipments/'+equipmentID+'/'+metertype+'/'+meterID)  
                .success(function (response, status, headers, config) {  
                    callback(null, status);  
                })  
                .error(function (e) {  
                    callback(e);  
                });  
        },
        getMetersByEquipmentID: function(id,metertype, callback) {  
            $http.get(getAPI()+'equipments/'+id+'/'+ metertype)  
                .success(function (response, status, headers, config) {  
                    callback(null, response);  
                })  
                .error(function (e) {  
                    callback(e);  
                });  
        }
    };
});  