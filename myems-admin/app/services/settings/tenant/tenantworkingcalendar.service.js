'use strict';
app.factory('TenantWorkingCalendarService', function($http) {
    return {
        addPair: function(tenantID, workingcalendarID, headers, callback) {
            $http.post(getAPI()+'tenants/'+tenantID+'/workingcalendars', {data: {"working_calendar_id": workingcalendarID}}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        deletePair: function(tenantID, workingcalendarID, headers, callback) {
            $http.delete(getAPI()+'tenants/'+tenantID+'/workingcalendars'+'/'+workingcalendarID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getWorkingCalendarsByTenantID: function(id,  callback) {
            $http.get(getAPI()+'tenants/'+id+'/workingcalendars')
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});
