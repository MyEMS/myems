'use strict';

// Microgrid Load service - REST API wrapper
app.factory('MicrogridLoadService', function($http) {
    return {
        // GET all microgrid loads
        getAllMicrogridLoads: function(headers, callback) {
            $http.get(getAPI()+'microgridloads', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // GET microgrid loads by microgrid id by ID
        getMicrogridLoadsByMicrogridID: function(id, headers, callback) {
            $http.get(getAPI()+'microgrids/'+id+'/loads', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // POST create microgrid load
        addMicrogridLoad: function(id, microgridload, headers, callback) {
            $http.post(getAPI()+'microgrids/'+id+'/loads',{data:microgridload}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // PUT update microgrid load
        editMicrogridLoad: function(id, microgridload, headers, callback) {
            $http.put(getAPI()+'microgrids/'+id+'/loads/'+microgridload.id,{data:microgridload}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // DELETE microgrid load
        deleteMicrogridLoad: function(id, microgridloadyID, headers, callback) {
            $http.delete(getAPI()+'microgrids/'+id+'/loads/'+microgridloadyID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // POST create load pair
        addLoadPair: function(id, lid, pid, headers, callback) {
            $http.post(
                getAPI()+'microgrids/'+id+'/loads/'+lid+'/points',
                {data: {point_id: pid}},
                {headers}
            )
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // DELETE load pair
        deleteLoadPair: function(id, lid, pid, headers, callback) {
            $http.delete(
                getAPI()+'microgrids/'+id+'/loads/'+lid+'/points/'+pid,
                {headers}
            )
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // GET points by load id by ID
        getPointsByLoadID: function(id, lid, headers, callback) {
            $http.get(
                getAPI()+'microgrids/'+id+'/loads/'+lid+'/points',
                {headers}
            )
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
    };
});
