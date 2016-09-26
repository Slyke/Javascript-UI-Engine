module.exports = {};

var settingsController = function(includes, settings) {

  var monitoringSettings = null;

  this.init = function() {

    monitoringSettings = false;

    console.log("settingsController::init(): Completed");
    console.log("");
  };

  this.writeSettings = function(newSettings) {
    includes.fs.writeFile('settings.json', JSON.stringify(newSettings, null, settings.outputs.jsonSpaces), function (err) {
      if (err) {
        console.log(Math.round(new Date().getTime()/1000).toString(), " | settingsController::writeSettings(): Error: ", err);
      } else {
        console.log(Math.round(new Date().getTime()/1000).toString(), " | settingsController::writeSettings(): : Settings written to file.");
      }
    });
  };

  this.readSettings = function(settingsFilePath) {

    settingsFilePath = (settingsFilePath ? settingsFilePath : "settings.json");

    try {
      settings = JSON.parse(includes.fs.readFileSync(settingsFilePath));
    } catch (e) {
      console.log(Math.round(new Date().getTime()/1000).toString(), " | settingsController::writeSettings(): Error: ", e);
      return false;
    }

    console.log(Math.round(new Date().getTime()/1000).toString(), " | settingsController::readSettings(): Loaded settings.");
    console.log("");

    this.monitorSettingsCheck();

    return settings;

  };

  this.mergeSettings = function(settingsToMerge) {
    var newSettings = {};

    for (var settingName in settings) {
      newSettings[settingName] = settings[settingName];
    }

    for (var settingName in settingsToMerge) {
      newSettings[settingName] = settingsToMerge[settingName];
      if (newSettings[settingName] === "_DELETE_SETTING_PROPERTY_") {
        delete newSettings[settingName];
      }
    }

    return newSettings;
  };

  this.monitorSettingsCheck = function(settingsFilePath) { //Monitor the settings file for changes, and reload it if changes are detected.

    settingsFilePath = (settingsFilePath ? settingsFilePath : "settings.json");

    if (monitoringSettings) {
      monitoringSettings.close();
    }

    if (settings.monitorSettingsFile) {
      monitoringSettings = includes.fs.watch(settingsFilePath, function (currentTime, previousTime) {
        includes.settingsController.readSettings(settingsFilePath);
      });
    }
  };

  this.updateSettings = function(newSettings) {
    var newSettings = this.mergeSettings(newSettings);
    var oldSettings = JSON.stringify(JSON.parse(settings));
    //TODO: Check settings validity

    settings = newSettings;
    this.writeSettings(settings);
  };

  return this;
};

module.exports = settingsController;
