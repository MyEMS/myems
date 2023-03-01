'use strict';
app.factory('StoreWorkingCalendarService', function($http) {
    return {
        addPair: function(storeID, workingcalendarID, headers, callback) {
            $http.post(getAPI()+'stores/'+storeID+'/workingcalendars', {data: {"working_calendar_id": workingcalendarID}}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        deletePair: function(storeID, workingcalendarID, headers, callback) {
            $http.delete(getAPI()+'stores/'+storeID+'/workingcalendars'+'/'+workingcalendarID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getWorkingCalendarsByStoreID: function(id, callback) {
            $http.get(getAPI()+'stores/'+id+'/workingcalendars')
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});
