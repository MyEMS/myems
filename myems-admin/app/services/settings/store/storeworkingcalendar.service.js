'use strict';

// Store Working Calendar service - REST API wrapper
app.factory('StoreWorkingCalendarService', function($http) {
    return {
        // POST create pair
        addPair: function(storeID, workingcalendarID, headers, callback) {
            $http.post(getAPI()+'stores/'+storeID+'/workingcalendars', {data: {"working_calendar_id": workingcalendarID}}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        // DELETE pair
        deletePair: function(storeID, workingcalendarID, headers, callback) {
            $http.delete(getAPI()+'stores/'+storeID+'/workingcalendars'+'/'+workingcalendarID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // GET working calendars by store id by ID
        getWorkingCalendarsByStoreID: function(id, headers, callback) {
            $http.get(getAPI()+'stores/'+id+'/workingcalendars', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});
