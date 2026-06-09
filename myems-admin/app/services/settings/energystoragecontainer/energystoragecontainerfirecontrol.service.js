"use strict";

// Energy Storage Container Fire Control service - REST API wrapper
app.factory("EnergyStorageContainerFirecontrolService", function ($http) {
  return {
        // GET all energy storage container firecontrols
    getAllEnergyStorageContainerFirecontrols: function (headers, callback) {
      $http
        .get(getAPI() + "energystoragecontainerfirecontrols", { headers })
        .then(
          function (response) {
            callback(response);
          },
          function (response) {
            callback(response);
          }
        );
    },
        // GET energy storage container firecontrols by energy storage container id by ID
    getEnergyStorageContainerFirecontrolsByEnergyStorageContainerID: function (
      id,
      headers,
      callback
    ) {
      $http
        .get(getAPI() + "energystoragecontainers/" + id + "/firecontrols", {
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
        // POST create energy storage container firecontrol
    addEnergyStorageContainerFirecontrol: function (
      id,
      energystoragecontainerfirecontrol,
      headers,
      callback
    ) {
      $http
        .post(
          getAPI() + "energystoragecontainers/" + id + "/firecontrols",
          { data: energystoragecontainerfirecontrol },
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
        // PUT update energy storage container firecontrol
    editEnergyStorageContainerFirecontrol: function (
      id,
      energystoragecontainerfirecontrol,
      headers,
      callback
    ) {
      $http
        .put(
          getAPI() +
            "energystoragecontainers/" +
            id +
            "/firecontrols/" +
            energystoragecontainerfirecontrol.id,
          { data: energystoragecontainerfirecontrol },
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
        // DELETE energy storage container firecontrol
    deleteEnergyStorageContainerFirecontrol: function (
      id,
      energystoragecontainerfirecontrolID,
      headers,
      callback
    ) {
      $http
        .delete(
          getAPI() +
            "energystoragecontainers/" +
            id +
            "/firecontrols/" +
            energystoragecontainerfirecontrolID,
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
        // POST create pair
    addPair: function (id, fid, pid, headers, callback) {
      $http
        .post(
          getAPI() +
            "energystoragecontainers/" +
            id +
            "/firecontrols/" +
            fid +
            "/points",
          { data: { point_id: pid } },
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
    deletePair: function (id, fid, pid, headers, callback) {
      $http
        .delete(
          getAPI() +
            "energystoragecontainers/" +
            id +
            "/firecontrols/" +
            fid +
            "/points/" +
            pid,
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
        // GET points by firecontrol id by ID
    getPointsByFirecontrolID: function (id, fid, headers, callback) {
      $http
        .get(
          getAPI() +
            "energystoragecontainers/" +
            id +
            "/firecontrols/" +
            fid +
            "/points",
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
