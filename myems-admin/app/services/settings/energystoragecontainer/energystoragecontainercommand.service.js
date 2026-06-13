"use strict";

// Energy Storage Container Command service - REST API wrapper
app.factory("EnergyStorageContainerCommandService", function ($http) {
  return {
        // POST create pair
    addPair: function (energystoragecontainerID, commandID, headers, callback) {
      $http
        .post(
          getAPI() +
            "energystoragecontainers/" +
            energystoragecontainerID +
            "/commands",
          { data: { command_id: commandID } },
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
      energystoragecontainerID,
      commandID,
      headers,
      callback
    ) {
      $http
        .delete(
          getAPI() +
            "energystoragecontainers/" +
            energystoragecontainerID +
            "/commands/" +
            commandID,
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
        // GET commands by energy storage container id by ID
    getCommandsByEnergyStorageContainerID: function (id, headers, callback) {
      $http
        .get(getAPI() + "energystoragecontainers/" + id + "/commands", {
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
