'use strict';

// Photovoltaic Power Station Load service - REST API wrapper
app.factory('PhotovoltaicPowerStationLoadService', function($http) {
    return {
        // GET all photovoltaic power station loads
        getAllPhotovoltaicPowerStationLoads: function(headers, callback) {
            $http.get(getAPI()+'photovoltaicpowerstationloads', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // GET photovoltaic power station loads by photovoltaic power station id by ID
        getPhotovoltaicPowerStationLoadsByPhotovoltaicPowerStationID: function(id, headers, callback) {
            $http.get(getAPI()+'photovoltaicpowerstations/'+id+'/loads', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // POST create photovoltaic power station load
        addPhotovoltaicPowerStationLoad: function(id, photovoltaicpowerstationload, headers, callback) {
            $http.post(getAPI()+'photovoltaicpowerstations/'+id+'/loads',{data:photovoltaicpowerstationload}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // PUT update photovoltaic power station load
        editPhotovoltaicPowerStationLoad: function(id, photovoltaicpowerstationload, headers, callback) {
            $http.put(getAPI()+'photovoltaicpowerstations/'+id+'/loads/'+photovoltaicpowerstationload.id,{data:photovoltaicpowerstationload}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // DELETE photovoltaic power station load
        deletePhotovoltaicPowerStationLoad: function(id, photovoltaicpowerstationloadyID, headers, callback) {
            $http.delete(getAPI()+'photovoltaicpowerstations/'+id+'/loads/'+photovoltaicpowerstationloadyID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // POST create pair
        addPair: function(id, lid, pid, headers, callback) {
            $http.post(
                getAPI()+'photovoltaicpowerstations/'+id+'/loads/'+lid+'/points',
                {data: {point_id: pid}},
                {headers}
            )
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // DELETE pair
        deletePair: function(id, lid, pid, headers, callback) {
            $http.delete(
                getAPI()+'photovoltaicpowerstations/'+id+'/loads/'+lid+'/points/'+pid,
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
                getAPI()+'photovoltaicpowerstations/'+id+'/loads/'+lid+'/points',
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
