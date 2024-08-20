![Logo](https://github.com/daveyclayton/dodo/blob/master/assets/icon128.png)

A Chrome extension that takes the JSON from Celtra PSD Plugin and imports it to a new Celtra 2.0 Design File.

# TODO
    - Add local file upload support
    - Support for retina/non retina? (plugin limitation?)
# Installation
The extension is not (yet) published on the Chrome Web Store. You can download the [ZIP](https://drive.google.com/file/d/1deo_b8cliPp8AZ2w6N8ax5-sSB67nW8h/view?usp=drive_link) (studio) or clone the [repo from GitHub](https://github.com/daveyclayton/dodo) (devs) and manually install the extension by following these steps:
1. Open the Google Chrome browser.
2. Navigate to `chrome://extensions`
3. Make sure that Developer mode is turned on.
4. Drag and drop the ZIP to the Chrome Extensions tab (studio) or click on Load unpacked and point to the repo folder (devs).
5. For the best experience, pin the extension to your taskbar.

Steps 1, 2, 3, and 4.
![Steps 1, 2, 3, and 4](https://github.com/celtra/birdsOfPrey/blob/master/assets/install_extension.png)

Step 5.
![Steps 5](https://github.com/celtra/birdsOfPrey/blob/master/assets/pin_to_taskbar.png)

# Usage
1. Install the extension.
2. When you first open it, the options page will show up. Follow the instructions and enter the API App details.
3. Use the Celtra PSD exporter plugin available from Adobe Creative Cloud to export your PSD to layers and JSON
4. Open the PSD sync folder
5. Open the file [PSD name].layout and copy the contents
6. Paste the contents into the "Plugin JSON" field in the Chrome extension
7. Paste the desired Celtra account ID to import the design file into
8. Check the created Eagle Design File and adjust it to be pixel perfect. Please note the Known limitations of the migration extension listed below.
9. If something does not work, you are encountering issues, or you would like to submit a suggestion (perhaps a missing feature not listed in Known limitations or something else), please post to the `#birds-of-prey` slack channel.
10. You can update the API App details by right-clicking the extension icon and clicking the 'Options' menu item.

NOTE: if you close the extension while the migration is in progress the migration will stop.