'use strict';

// Working Calendar Non-working Day service - REST API wrapper
app.factory('WorkingCalendarNonWorkingDayService', function($http) {
    return {
        // POST create non working day
        addNonWorkingDay: function(workingCalendarID, nonWorkingDay, headers, callback) {
            $http.post(getAPI()+'workingcalendars/'+workingCalendarID+'/nonworkingdays', {data:nonWorkingDay}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        // DELETE non working day
        deleteNonWorkingDay: function(workingCalendarID, headers, callback) {
            $http.delete(getAPI()+'nonworkingdays/'+workingCalendarID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        
        // PUT update non working day
        editNonWorkingDay: function(workingCalendarID, nonWorkingDay, headers, callback) {
            $http.put(getAPI()+'nonworkingdays/'+workingCalendarID, {data:nonWorkingDay}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        // GET non working days by working calendar id by ID
        getNonWorkingDaysByWorkingCalendarID: function(id, headers, callback) {
            $http.get(getAPI()+'workingcalendars/'+id+'/nonworkingdays', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});
