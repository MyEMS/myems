'use strict';

// Microgrid Photovoltaic service - REST API wrapper
app.factory('MicrogridPhotovoltaicService', function($http) {
    return {
        // GET all microgrid photovoltaics
        getAllMicrogridPhotovoltaics: function(headers, callback) {
            $http.get(getAPI()+'microgridphotovoltaics', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // GET microgrid photovoltaics by microgrid id by ID
        getMicrogridPhotovoltaicsByMicrogridID: function(id, headers, callback) {
            $http.get(getAPI()+'microgrids/'+id+'/photovoltaics', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // POST create microgrid photovoltaic
        addMicrogridPhotovoltaic: function(id, microgridphotovoltaic, headers, callback) {
            $http.post(getAPI()+'microgrids/'+id+'/photovoltaics',{data:microgridphotovoltaic}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // PUT update microgrid photovoltaic
        editMicrogridPhotovoltaic: function(id, microgridphotovoltaic, headers, callback) {
            $http.put(getAPI()+'microgrids/'+id+'/photovoltaics/'+microgridphotovoltaic.id,{data:microgridphotovoltaic}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // DELETE microgrid photovoltaic
        deleteMicrogridPhotovoltaic: function(id, microgridphotovoltaicyID, headers, callback) {
            $http.delete(getAPI()+'microgrids/'+id+'/photovoltaics/'+microgridphotovoltaicyID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // POST create photovoltaic pair
        addPhotovoltaicPair: function(id, pid, ptid, headers, callback) {
            $http.post(
                getAPI()+'microgrids/'+id+'/photovoltaics/'+pid+'/points',
                {data: {point_id: ptid}},
                {headers}
            )
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // DELETE photovoltaic pair
        deletePhotovoltaicPair: function(id, pid, ptid, headers, callback) {
            $http.delete(
                getAPI()+'microgrids/'+id+'/photovoltaics/'+pid+'/points/'+ptid,
                {headers}
            )
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // GET points by photovoltaic id by ID
        getPointsByPhotovoltaicID: function(id, pid, headers, callback) {
            $http.get(
                getAPI()+'microgrids/'+id+'/photovoltaics/'+pid+'/points',
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
