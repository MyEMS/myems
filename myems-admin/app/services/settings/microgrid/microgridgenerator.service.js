'use strict';

// Microgrid Generator service - REST API wrapper
app.factory('MicrogridGeneratorService', function($http) {
    return {
        // GET all microgrid generators
        getAllMicrogridGenerators: function(headers, callback) {
            $http.get(getAPI()+'microgridgenerators', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // GET microgrid generators by microgrid id by ID
        getMicrogridGeneratorsByMicrogridID: function(id, headers, callback) {
            $http.get(getAPI()+'microgrids/'+id+'/generators', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // POST create microgrid generator
        addMicrogridGenerator: function(id, microgridgenerator, headers, callback) {
            $http.post(getAPI()+'microgrids/'+id+'/generators',{data:microgridgenerator}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // PUT update microgrid generator
        editMicrogridGenerator: function(id, microgridgenerator, headers, callback) {
            $http.put(getAPI()+'microgrids/'+id+'/generators/'+microgridgenerator.id,{data:microgridgenerator}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // DELETE microgrid generator
        deleteMicrogridGenerator: function(id, microgridgeneratoryID, headers, callback) {
            $http.delete(getAPI()+'microgrids/'+id+'/generators/'+microgridgeneratoryID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // POST create generator pair
        addGeneratorPair: function(id, gid, pid, headers, callback) {
            $http.post(
                getAPI()+'microgrids/'+id+'/generators/'+gid+'/points',
                {data: {point_id: pid}},
                {headers}
            )
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // DELETE generator pair
        deleteGeneratorPair: function(id, gid, pid, headers, callback) {
            $http.delete(
                getAPI()+'microgrids/'+id+'/generators/'+gid+'/points/'+pid,
                {headers}
            )
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // GET points by generator id by ID
        getPointsByGeneratorID: function(id, gid, headers, callback) {
            $http.get(
                getAPI()+'microgrids/'+id+'/generators/'+gid+'/points',
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
