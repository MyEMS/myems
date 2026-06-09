'use strict';

// Tenant Working Calendar service - REST API wrapper
app.factory('TenantWorkingCalendarService', function($http) {
    return {
        // POST create pair
        addPair: function(tenantID, workingcalendarID, headers, callback) {
            $http.post(getAPI()+'tenants/'+tenantID+'/workingcalendars', {data: {"working_calendar_id": workingcalendarID}}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        // DELETE pair
        deletePair: function(tenantID, workingcalendarID, headers, callback) {
            $http.delete(getAPI()+'tenants/'+tenantID+'/workingcalendars'+'/'+workingcalendarID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // GET working calendars by tenant id by ID
        getWorkingCalendarsByTenantID: function(id, headers, callback) {
            $http.get(getAPI()+'tenants/'+id+'/workingcalendars', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});
