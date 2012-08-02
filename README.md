Cordova implementation for Tizen
===

Cordova implementation for Tizen is a JavaScript Wrapper library allowing to build and run Cordova based projects on [Tizen](https://www.tizen.org/).
Cordova based applications are, at the core, an application written with web technology: HTML, CSS and JavaScript.

Apache Cordova is an effort undergoing incubation at The Apache Software Foundation (ASF), sponsored by the Apache Incubator project. Incubation is required of all newly accepted projects until a further review indicates that the infrastructure, communications, and decision making process have stabilized in a manner consistent with other successful ASF projects. While incubation status is not necessarily a reflection of the completeness or stability of the code, it does indicate that the project has yet to be fully endorsed by the ASF.

Pre-requisites
---
 - [Tizen SDK 1.0 Larkspur Release](https://developer.tizen.org/sdk)

Directory Structure
---
    /tizen
        /samples ..... Ready-to-run Tizen Eclipse IDE sample projects
        /templates ... Cordova Tizen SDK projects templates for Tizen Eclipse IDE
        /www ......... Barebones project assets

Import a Cordova Tizen project sample into Tizen Eclipse IDE
----

1. File -> Import
2. Select Import Source: Widget -> Projects and Widget file -> Next
3. Import Widget -> Select root directory: Point to the one of the sample projects (e.g: /cordova-basic) -> Finish
4. The project should be available now in the Tizen Eclipse IDE Project Explorer
5. You can now go to the [Build and Deploy a project] section of this document


Install Cordova Tizen project templates into Tizen Eclipse IDE
----
1. Copy the entire /templates directory content into you Tizen Eclipse IDE web templates directory (e.g: /home/my_username/tizen-sdk/IDE/Templates/web)
2. You can now create Cordova Tizen project by using Tizen Eclipse IDE project templates

Create a project with the Tizen Eclipse IDE Cordova Tizen project templates
----
1. File -> New -> Tizen Web Project.
2. Select: User Template.
3. Select: User defined.
4. Select one of the Cordova templates, fill the Project Name, then -> Finish.
5. The project should be available now in the Tizen Eclipse IDE Project Explorer
6. You can now go to the [Build and Deploy a project] section of this document

Build and Deploy a project
----
1. Select and Right click the project -> Select Build project, this will generate your project widget package (.wgt)
2. Select and Right click the project -> Run As -> Here you can choose:
 - Tizen Web Simulator application
 - Tizen Web application (this will deploy you application to a pre-launched Tizen emulator or a Tizen connected device)

Barebones project assets
----

The `www` folder contains the Cordova specific assets that must be available in a Tizen Web project to make it 'Cordova enabled'.
If you have an existing Tizen Web application project, copy/merge these files into its root directory.

    /www
        config.xml .............. Tizen configuration file
        cordova-x.y.z.js ........ Tizen Cordova JavaScript API implementation library
        /sounds
            beep.wav ............ Needed for Cordova Notification API implementation

Add the following lines into the `<head>` section of your `index.html` project file:

    <script type="text/javascript" src="js/cordova.x.y.z.js"></script>

`config.xml` is a sample that you are free to alter or merge with an existing Tizen configuration file.
It contains the `<feature>` elements required by the Cordova API.
 
Further Reading
---

- [Cordova home](http://incubator.apache.org/cordova/)
- [Cordova Documentation](http://docs.phonegap.com)
- [Cordova Issue Tracker](https://issues.apache.org/jira/browse/CB)
- [Tizen Web SDK Documentation](https://developer.tizen.org/documentation)

