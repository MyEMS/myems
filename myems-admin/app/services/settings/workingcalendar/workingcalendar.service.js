'use strict';

// Working Calendar service - REST API wrapper
app.factory('WorkingCalendarService', function($http) {
    return {
        // GET all working calendars
        getAllWorkingCalendars:function(headers, callback){
            $http.get(getAPI()+'workingcalendars', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // POST create working calendar
        addWorkingCalendar: function(workingcalendar, headers, callback) {
            $http.post(getAPI()+'workingcalendars',{data:workingcalendar}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // PUT update working calendar
        editWorkingCalendar: function(workingcalendar, headers, callback) {
            $http.put(getAPI()+'workingcalendars/'+workingcalendar.id,{data:workingcalendar}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // DELETE working calendar
        deleteWorkingCalendar: function(workingcalendar, headers, callback) {
            $http.delete(getAPI()+'workingcalendars/'+workingcalendar.id, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // GET export working calendar
        exportWorkingCalendar: function(workingcalendar, headers, callback) {
            $http.get(getAPI()+'workingcalendars/'+workingcalendar.id+'/export', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // POST import working calendar
        importWorkingCalendar: function(importdata, headers, callback) {
            $http.post(getAPI()+'workingcalendars/import', JSON.parse(importdata), {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // POST clone working calendar
        cloneWorkingCalendar: function(workingcalendar, headers, callback) {
            $http.post(getAPI()+'workingcalendars/'+workingcalendar.id+'/clone', {data:null}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
    };
});
