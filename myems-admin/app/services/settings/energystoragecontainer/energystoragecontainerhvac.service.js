"use strict";

// Energy Storage Container HVAC service - REST API wrapper
app.factory("EnergyStorageContainerHVACService", function ($http) {
  return {
        // GET all energy storage container hva cs
    getAllEnergyStorageContainerHVACs: function (headers, callback) {
      $http.get(getAPI() + "energystoragecontainerhvacs", { headers }).then(
        function (response) {
          callback(response);
        },
        function (response) {
          callback(response);
        }
      );
    },
        // GET energy storage container hva cs by energy storage container id by ID
    getEnergyStorageContainerHVACsByEnergyStorageContainerID: function (
      id,
      headers,
      callback
    ) {
      $http
        .get(getAPI() + "energystoragecontainers/" + id + "/hvacs", { headers })
        .then(
          function (response) {
            callback(response);
          },
          function (response) {
            callback(response);
          }
        );
    },
        // POST create energy storage container hvac
    addEnergyStorageContainerHVAC: function (
      id,
      energystoragecontainerhvac,
      headers,
      callback
    ) {
      $http
        .post(
          getAPI() + "energystoragecontainers/" + id + "/hvacs",
          { data: energystoragecontainerhvac },
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
        // PUT update energy storage container hvac
    editEnergyStorageContainerHVAC: function (
      id,
      energystoragecontainerhvac,
      headers,
      callback
    ) {
      $http
        .put(
          getAPI() +
            "energystoragecontainers/" +
            id +
            "/hvacs/" +
            energystoragecontainerhvac.id,
          { data: energystoragecontainerhvac },
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
        // DELETE energy storage container hvac
    deleteEnergyStorageContainerHVAC: function (
      id,
      energystoragecontainerhvacID,
      headers,
      callback
    ) {
      $http
        .delete(
          getAPI() +
            "energystoragecontainers/" +
            id +
            "/hvacs/" +
            energystoragecontainerhvacID,
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
    addPair: function (id, hid, pid, headers, callback) {
      $http
        .post(
          getAPI() +
            "energystoragecontainers/" +
            id +
            "/hvacs/" +
            hid +
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
    deletePair: function (id, hid, pid, headers, callback) {
      $http
        .delete(
          getAPI() +
            "energystoragecontainers/" +
            id +
            "/hvacs/" +
            hid +
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
        // GET points by hvacid by ID
    getPointsByHVACID: function (id, hid, headers, callback) {
      $http
        .get(
          getAPI() +
            "energystoragecontainers/" +
            id +
            "/hvacs/" +
            hid +
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
