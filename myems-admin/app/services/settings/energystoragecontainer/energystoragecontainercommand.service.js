"use strict";
app.factory("EnergyStorageContainerCommandService", function ($http) {
  return {
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
