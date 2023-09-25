'use strict';
app.factory('AdvancedReportService', function($http) {
    return {
        getAllAdvancedReport:function(headers, callback){
            $http.get(getAPI()+'advancedreports', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        searchAdvancedReport: function(query, headers, callback) {
            $http.get(getAPI()+'advancedreports', { params: { q: query } }, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        addAdvancedReport: function(advancedreport, headers, callback) {
            $http.post(getAPI()+'advancedreports', {data:advancedreport}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        editAdvancedReport: function(advancedreport, headers, callback) {
            $http.put(getAPI()+'advancedreports/'+advancedreport.id,{data:advancedreport}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        runAdvancedReport: function(advancedreport, headers, callback) {
            $http.put(getAPI()+'advancedreports/'+advancedreport.id+'/run',{data:advancedreport}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        deleteAdvancedReport: function(advancedreport, headers, callback) {
            $http.delete(getAPI()+'advancedreports/'+advancedreport.id, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getAdvancedReport: function(id, headers, callback) {
            $http.get(getAPI()+'advancedreports/'+id, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});