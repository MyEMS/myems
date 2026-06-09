"use strict";

// Energy Storage Container Schedule service - REST API wrapper
app.factory("EnergyStorageContainerScheduleService", function ($http) {
  return {
        // GET all energy storage container schedules
    getAllEnergyStorageContainerSchedules: function (headers, callback) {
      $http.get(getAPI() + "energystoragecontainerschedules", { headers }).then(
        function (response) {
          callback(response);
        },
        function (response) {
          callback(response);
        }
      );
    },
        // GET energy storage container schedules by energy storage container id by ID
    getEnergyStorageContainerSchedulesByEnergyStorageContainerID: function (
      id,
      headers,
      callback
    ) {
      $http
        .get(getAPI() + "energystoragecontainers/" + id + "/schedules", {
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
        // POST create energy storage container schedule
    addEnergyStorageContainerSchedule: function (
      id,
      energystoragecontainerschedule,
      headers,
      callback
    ) {
      $http
        .post(
          getAPI() + "energystoragecontainers/" + id + "/schedules",
          { data: energystoragecontainerschedule },
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
        // PUT update energy storage container schedule
    editEnergyStorageContainerSchedule: function (
      id,
      energystoragecontainerschedule,
      headers,
      callback
    ) {
      $http
        .put(
          getAPI() +
            "energystoragecontainers/" +
            id +
            "/schedules/" +
            energystoragecontainerschedule.id,
          { data: energystoragecontainerschedule },
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
        // DELETE energy storage container schedule
    deleteEnergyStorageContainerSchedule: function (
      id,
      energystoragecontainerscheduleyID,
      headers,
      callback
    ) {
      $http
        .delete(
          getAPI() +
            "energystoragecontainers/" +
            id +
            "/schedules/" +
            energystoragecontainerscheduleyID,
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
