"use strict";

// Energy Storage Container Battery service - REST API wrapper
app.factory("EnergyStorageContainerBatteryService", function ($http) {
  return {
        // GET all energy storage container batteries
    getAllEnergyStorageContainerBatteries: function (headers, callback) {
      $http.get(getAPI() + "energystoragecontainerbatteries", { headers }).then(
        function (response) {
          callback(response);
        },
        function (response) {
          callback(response);
        }
      );
    },
        // GET energy storage container batteries by energy storage container id by ID
    getEnergyStorageContainerBatteriesByEnergyStorageContainerID: function (
      id,
      headers,
      callback
    ) {
      $http
        .get(getAPI() + "energystoragecontainers/" + id + "/batteries", {
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
        // POST create energy storage container battery
    addEnergyStorageContainerBattery: function (
      id,
      energystoragecontainerbattery,
      headers,
      callback
    ) {
      $http
        .post(
          getAPI() + "energystoragecontainers/" + id + "/batteries",
          { data: energystoragecontainerbattery },
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
        // PUT update energy storage container battery
    editEnergyStorageContainerBattery: function (
      id,
      energystoragecontainerbattery,
      headers,
      callback
    ) {
      $http
        .put(
          getAPI() +
            "energystoragecontainers/" +
            id +
            "/batteries/" +
            energystoragecontainerbattery.id,
          { data: energystoragecontainerbattery },
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

        // DELETE energy storage container battery
    deleteEnergyStorageContainerBattery: function (
      id,
      energystoragecontainerbatteryID,
      headers,
      callback
    ) {
      $http
        .delete(
          getAPI() +
            "energystoragecontainers/" +
            id +
            "/batteries/" +
            energystoragecontainerbatteryID,
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
    addPair: function (id, bid, pid, headers, callback) {
      $http
        .post(
          getAPI() +
            "energystoragecontainers/" +
            id +
            "/batteries/" +
            bid +
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
    deletePair: function (id, bid, pid, headers, callback) {
      $http
        .delete(
          getAPI() +
            "energystoragecontainers/" +
            id +
            "/batteries/" +
            bid +
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
        // GET points by bmsid by ID
    getPointsByBMSID: function (id, bid, headers, callback) {
      $http
        .get(
          getAPI() +
            "energystoragecontainers/" +
            id +
            "/batteries/" +
            bid +
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
