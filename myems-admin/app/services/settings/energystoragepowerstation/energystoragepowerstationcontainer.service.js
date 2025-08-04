"use strict";
app.factory("EnergyStoragePowerStationContainerService", function ($http) {
  return {
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
