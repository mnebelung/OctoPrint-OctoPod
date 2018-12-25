/*
 * View model for OctoPrint-OctoPod
 *
 * Author: Gaston Dombiak
 * License: Apache-2.0
 */
$(function() {
    function OctopodViewModel(parameters) {
        var self = this;

        // assign the injected parameters, e.g.:
         self.settingsViewModel = parameters[0];

        self.testActive = ko.observable(false);
        self.testResult = ko.observable(false);
        self.testSuccessful = ko.observable(false);
        self.testMessage = ko.observable();

        self.testNotification  = function() {
            self.testActive(true);
            self.testResult(false);
            self.testSuccessful(false);
            self.testMessage("");

            var serverURL = $('#server_url').val();
            var cameraSnapshotURL = $('#camera_snapshot_url').val();

            var payload = {
                command: "test",
                server_url: serverURL,
                camera_snapshot_url: cameraSnapshotURL
            };

            $.ajax({
                url: API_BASEURL + "plugin/octopod",
                type: "POST",
                dataType: "json",
                data: JSON.stringify(payload),
                contentType: "application/json; charset=UTF-8",
                success: function(response) {
                    self.testResult(true);
                    self.testSuccessful(response.code == 204);
                    if (response.code == -1) {
                        self.testMessage("No phone registered or configuration not completed");
                    } else if (response.code == 404) {
                        self.testMessage("404 - Notification Server URL was not found");
                    } else if (response.code == 500) {
                        self.testMessage("500 - Target server had an error");
                    } else if (response.code == -500) {
                        self.testMessage("There was an error sending message. Check logs");
                    } else {
                        self.testMessage(undefined);
                    }
                },
                complete: function() {
                    self.testActive(false);
                }
            });
        };

        self.onBeforeBinding = function() {
            self.settings = self.settingsViewModel.settings;
        };
    }

    /* view model class, parameters for constructor, container to bind to
     * Please see http://docs.octoprint.org/en/master/plugins/viewmodels.html#registering-custom-viewmodels for more details
     * and a full list of the available options.
     */
    OCTOPRINT_VIEWMODELS.push({
        construct: OctopodViewModel,
        // ViewModels your plugin depends on, e.g. loginStateViewModel, settingsViewModel, ...
        dependencies: [ "settingsViewModel" ],
        // Elements to bind to, e.g. #settings_plugin_octopod, #tab_plugin_octopod, ...
        elements: [ "#settings_plugin_octopod" ]
    });
});
