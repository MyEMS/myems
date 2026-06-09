"use strict";

// Energy Storage Power Station service - REST API wrapper
app.factory("EnergyStoragePowerStationService", function ($http) {
  return {
        // GET all energy storage power stations
    getAllEnergyStoragePowerStations: function (headers, callback) {
      $http.get(getAPI() + "energystoragepowerstations", { headers }).then(
        function (response) {
          callback(response);
        },
        function (response) {
          callback(response);
        }
      );
    },
        // Search energy storage power stations by query
    searchEnergyStoragePowerStations: function(query, headers, callback) {
        $http.get(getAPI()+'energystoragepowerstations', { params: { q: query },headers: headers })
        .then(function (response) {
            callback(response);
        }, function (response) {
            callback(response);
        });
    },
        // POST create energy storage power station
    addEnergyStoragePowerStation: function (
      energystoragepowerstation,
      headers,
      callback
    ) {
      $http
        .post(
          getAPI() + "energystoragepowerstations",
          { data: energystoragepowerstation },
          { headers }
        )
        .then(
          function (response) {
            callback(response);
          },
          function (response) {
            callback(response);
          }
        );
    },
        // PUT update energy storage power station
    editEnergyStoragePowerStation: function (
      energystoragepowerstation,
      headers,
      callback
    ) {
      $http
        .put(
          getAPI() +
            "energystoragepowerstations/" +
            energystoragepowerstation.id,
          { data: energystoragepowerstation },
          { headers }
        )
        .then(
          function (response) {
            callback(response);
          },
          function (response) {
            callback(response);
          }
        );
    },
        // DELETE energy storage power station
    deleteEnergyStoragePowerStation: function (
      energystoragepowerstation,
      headers,
      callback
    ) {
      $http
        .delete(
          getAPI() +
            "energystoragepowerstations/" +
            energystoragepowerstation.id,
          { headers }
        )
        .then(
          function (response) {
            callback(response);
          },
          function (response) {
            callback(response);
          }
        );
    },
        // GET export energy storage power station
    exportEnergyStoragePowerStation: function (
      energystoragepowerstation,
      headers,
      callback
    ) {
      $http
        .get(
          getAPI() +
            "energystoragepowerstations/" +
            energystoragepowerstation.id +
            "/export",
          { headers }
        )
        .then(
          function (response) {
            callback(response);
          },
          function (response) {
            callback(response);
          }
        );
    },
        // POST import energy storage power station
    importEnergyStoragePowerStation: function (importdata, headers, callback) {
      $http
        .post(
          getAPI() + "energystoragepowerstations/import",
          JSON.parse(importdata),
          { headers }
        )
        .then(
          function (response) {
            callback(response);
          },
          function (response) {
            callback(response);
          }
        );
    },
        // POST clone energy storage power station
    cloneEnergyStoragePowerStation: function (
      energystoragepowerstation,
      headers,
      callback
    ) {
      $http
        .post(
          getAPI() +
            "energystoragepowerstations/" +
            energystoragepowerstation.id +
            "/clone",
          { data: null },
          { headers }
        )
        .then(
          function (response) {
            callback(response);
          },
          function (response) {
            callback(response);
          }
        );
    },
  };
});
