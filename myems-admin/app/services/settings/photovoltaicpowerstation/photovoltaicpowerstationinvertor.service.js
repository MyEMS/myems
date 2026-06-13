'use strict';

// Photovoltaic Power Station Inverter service - REST API wrapper
app.factory('PhotovoltaicPowerStationInvertorService', function($http) {
    return {
        // GET all photovoltaic power station invertors
        getAllPhotovoltaicPowerStationInvertors: function(headers, callback) {
            $http.get(getAPI()+'photovoltaicpowerstationinvertors', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // GET photovoltaic power station invertors by photovoltaic power station id by ID
        getPhotovoltaicPowerStationInvertorsByPhotovoltaicPowerStationID: function(id, headers, callback) {
            $http.get(getAPI()+'photovoltaicpowerstations/'+id+'/invertors', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // POST create photovoltaic power station invertor
        addPhotovoltaicPowerStationInvertor: function(id, photovoltaicpowerstationinvertor, headers, callback) {
            $http.post(getAPI()+'photovoltaicpowerstations/'+id+'/invertors',{data:photovoltaicpowerstationinvertor}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // PUT update photovoltaic power station invertor
        editPhotovoltaicPowerStationInvertor: function(id, photovoltaicpowerstationinvertor, headers, callback) {
            $http.put(getAPI()+'photovoltaicpowerstations/'+id+'/invertors/'+photovoltaicpowerstationinvertor.id,{data:photovoltaicpowerstationinvertor}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // DELETE photovoltaic power station invertor
        deletePhotovoltaicPowerStationInvertor: function(id, photovoltaicpowerstationinvertoryID, headers, callback) {
            $http.delete(getAPI()+'photovoltaicpowerstations/'+id+'/invertors/'+photovoltaicpowerstationinvertoryID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // POST create pair
        addPair: function(id, iid, pid, headers, callback) {
            $http.post(
                getAPI()+'photovoltaicpowerstations/'+id+'/invertors/'+iid+'/points',
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
        deletePair: function(id, iid, pid, headers, callback) {
            $http.delete(
                getAPI()+'photovoltaicpowerstations/'+id+'/invertors/'+iid+'/points/'+pid,
                {headers}
            )
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // GET points by invertor id by ID
        getPointsByInvertorID: function(id, iid, headers, callback) {
            $http.get(
                getAPI()+'photovoltaicpowerstations/'+id+'/invertors/'+iid+'/points',
                {headers}
            )
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});