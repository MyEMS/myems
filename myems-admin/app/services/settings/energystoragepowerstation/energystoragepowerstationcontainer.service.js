"use strict";

// Energy Storage Power Station Container service - REST API wrapper
app.factory("EnergyStoragePowerStationContainerService", function ($http) {
  return {
        // POST create pair
    addPair: function (
      energystoragepowerstationID,
      containerID,
      headers,
      callback
    ) {
      $http
        .post(
          getAPI() +
            "energystoragepowerstations/" +
            energystoragepowerstationID +
            "/containers",
          { data: { energy_storage_container_id: containerID } },
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

        // DELETE pair
    deletePair: function (
      energystoragepowerstationID,
      containerID,
      headers,
      callback
    ) {
      $http
        .delete(
          getAPI() +
            "energystoragepowerstations/" +
            energystoragepowerstationID +
            "/containers/" +
            containerID,
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
        // GET containers by energy storage power station id by ID
    getContainersByEnergyStoragePowerStationID: function (
      id,
      headers,
      callback
    ) {
      $http
        .get(getAPI() + "energystoragepowerstations/" + id + "/containers", {
          headers,
        })
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
