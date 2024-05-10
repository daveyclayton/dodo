![Logo](https://github.com/celtra/birdsOfPrey/blob/master/assets/icon128.png)

Falcon to Eagle Design File migration extension with quite some known limitations 😅

![Usage](https://github.com/celtra/birdsOfPrey/blob/master/assets/falcon_to_eagle_migration.gif)

# TODO
    - support transferring furniture
    - components of same name and clazz should be the same component in eagle
    - anchoring?
    - handling of choice components (once they are supported in eagle)

# Installation
The extension is not (yet) published on Chrome Web Store. You can clone the [repo from GitHub](https://github.com/celtra/birdsOfPrey) (devs) or download the ZIP & unpack it locally (studio) and manually install the extension by following these steps:
1. Open Google Chrome browser.
2. Navigate to `chrome://extensions`
3. Make sure that Developer mode is turned on.
4. Click the Load unpacked button and point to the directory where you unpacked the zip (or cloned the repository).
5. For the best experience, pin the extension to your taskbar.

Steps 1, 2, 3, and 4.
![Steps 1, 2, 3, and 4](https://github.com/celtra/birdsOfPrey/blob/master/assets/install_extension.png)

Step 5.
![Steps 5](https://github.com/celtra/birdsOfPrey/blob/master/assets/pin_to_taskbar.png)

# Usage
1. Install the extension.
2. When you first open it, the options page will show up. Follow the instructions and enter the API App details.
3. Enter the Falcon Design File ID you want to migrate and the destination account ID where the Eagle Design File should be created. Click migrate 🚀
4. Check the created Eagle Design File and adjust it to be pixel perfect. Please note the Known limitations of the migration extension listed below.
5. If something does not work, you are encountering issues or would like to submit a suggestion (perhaps a missing feature not listed in Known limitations or something else), please post to `#birds-of-prey` slack channel.

# Known limitations:
    - No support for Interactive HTML & Facebook Carousel
    - No Animations
    - No Feeds
    - No Highlight styles
    - No letterSpacing
    - No Auto-layout
