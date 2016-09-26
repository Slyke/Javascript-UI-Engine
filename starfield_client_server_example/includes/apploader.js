module.exports = {};

// This file handles loading the apps in the apps/ folder, it also handles the routes for said apps and custom generated settings for each app.

var appLoader = function(includes, settings) {

  this.getDirectories = function(sourcePath) {
    return includes.fs.readdirSync(sourcePath).filter(function(file) {
      return includes.fs.statSync(includes.path.join(sourcePath, file)).isDirectory();
    });
  }

 this.init = function() {
   var appsList = this.getDirectories(settings.servingAppsPath);

   console.log(Math.round(new Date().getTime()/1000).toString(), " | setupApps(): Adding Apps: ");
   for (webApp in appsList) {
     (function(webApp) {

       var appPath = settings.servingAppsPath + webApp;

         if (!settings.apps[webApp].useRouter) {
           includes.app.use("/" + appPath, includes.express.static(settings.servingAppsPath  + webApp));

         } else {
           includes.app.use("/" + appPath, includes.express.static(settings.servingAppsPath  + webApp));

           includes.app.use("/" + appPath + "*", function (req, res, next) {

               var filePath = appPath + req.originalUrl.replace("/" + appPath, "");

               includes.fs.exists(filePath, function (exists) {
                   if (exists) {
                       res.sendfile(filePath);
                   } else {
                     res.status(404);
                     res.send("NOT FOUND");

                   }
               });
           });
         }

      console.log("  /" + appPath + "*", "  - Mapped to:  ", settings.servingAppsPath + webApp);
      })(appsList[webApp]);
    }

   console.log(Math.round(new Date().getTime()/1000).toString(), " | setupApps(): Apps Added");
   console.log("");

 }

 return this;

}

module.exports = appLoader;
