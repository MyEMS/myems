'use strict';
app.factory('WorkingCalendarService', function($http) {
    return {
        getAllWorkingCalendars:function(callback){
            $http.get(getAPI()+'workingcalendars')
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        addWorkingCalendar: function(workingcalendar, headers, callback) {
            $http.post(getAPI()+'workingcalendars',{data:workingcalendar}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        editWorkingCalendar: function(workingcalendar, headers, callback) {
            $http.put(getAPI()+'workingcalendars/'+workingcalendar.id,{data:workingcalendar}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        deleteWorkingCalendar: function(workingcalendar, headers, callback) {
            $http.delete(getAPI()+'workingcalendars/'+workingcalendar.id, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getWorkingCalendar: function(id, callback) {
            $http.get(getAPI()+'workingcalendars/'+id)
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});
