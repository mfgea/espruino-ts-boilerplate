espruino-ts-boilerplate
=======================

An espruino boilerplate using Typescript.


Basic Usage
-----------

There are 3 commands you can run:

1. `npm run build`
Builds the typscript application into a single `dist/bundle.js` file that can be uploaded directly to the espruino. The bunlder takes care of doing tree shaking, typescript processing and minification, so the file is as small as possible.

2. `npm run build-debug`
Builds the typescript application just like the provious command, but avoiding minification. This does not mangle variable names or indentation.

3. `npm run upload`
Builds and uploads the bundle file to the espruino using [espruino-cli](https://github.com/gzip/esp-cli). The cli parameters are taken from the `config/env-config.yaml` file.

All three commands have a counterpart in VSCode IDE, so pressing `CMD+Shift+B` would bring up a dialog with all those commands to select.


Env Configuration
-----------------

Env configuration handles the parameters for the espruino-cli command. It currently uses:

- `port`: the OS port for the espruino device. E.g. `/dev/cu.wchusbserial1420` or `COM4` or `/dev/USBtty0`
- `port_speed`: determines the connection speed to the device. E.g. `115200`
- `board`: Especifies the board type. E.g. `ESP8266_4MB`


App configuration
-----------------

The app can be configured using the `config/app-config.yaml` and `config/app-config.user.yaml` files. All configurations there are taken by the bundler and replaced by the actual values when compiling.
That way, there are fewer variables in the espruino code, optimizing it a little bit.

Configurations in `app-config.user.yaml` overwrite the ones in `app-config.yaml`. Also, user configuration is not tracked in the repository.

For example:

app-config.yaml
```
wifi:
    network: mywifi
    password: xxx
```

app-config.user.yaml
```
wifi:
    password: mypassword
```

app.ts
```
wifi.connect(__CONFIG__.wifi.network, { password: __CONFIG__.wifi.password }, callback);
```

bundle.js
```
wifi.connect("mywifi", { password: "mypassword" }, callback);
```

### __CONFIG__ type definitions

The type definitions for the configuration parameters can be created in the `types/app.d.ts` file. This way, VSCode can autocomplete and validate the parameters.

app.d.ts
```
// Declare types
declare type __CONFIG__ = {
    // Your network name and password.
    wifi: {
        network: string,
        password: string,
    },
}

// Declare a global variable, for vscode to recognize it as a config container
declare var __CONFIG__:__CONFIG__;
```


Espruino Modules
----------------

Espruino modules must be downloaded, converted to `.ts` and directly imported from the filesystem. The `require('DHT22')` syntax (that works in EspruinoIDE) does not work here (as EspruinoIDE downloads the files right before uploading the code to the device).

File system
```
src/
    modules/
        DHT22.ts
    app.ts
```

app.ts
```
import DHT22 from './modules/DHT22';
DHT22.connect(...);
```


Data in flash memory
--------------------

Espruino allows saving data into the Flash memory. The best way to achieve this is by using the internal 'Storage' module.
For example, `require('Storage').write("wifi", E.toArrayBuffer(atob('B/gH/4PA8c/O7/33h7OecN/sBzgBtgAeAAeAAMAA')));` will save a wifi icon by the name of `wifi` that can be retrieved using `require('Storage').readArrayBuffer('wifi')`.

This boilerplate contains a `static-data` directory and a `StaticData.ts` module that can handle the upload (before sending code to Espruino) and the usage (in runtime) of that type of data.

- `static-data/files.js` (requireJS module format): contains an array of the data to be uploaded. In the example, images are being stored.

- `static-data/flash-files.js`: A nodeJS application that uploads every piece of data found in `files.js` to the espruino (using the same espruino-cli commands)

- `static-data/generate-file-descriptors`: A nodeJS application that generates an `index.ts` file containing descriptions for every upload (in the example, name, width and height of the image). This file can be imported by the app and be fed to the StaticData class:

app.ts
```
// SSD1306 128x64 display module
import SSD1306 from './modules/SSD1306';

import StaticData from './modules/StaticData';
import images from '../static-data/index';

const ImagesData = new StaticData(images);

// Setup I2C
const i2c = new I2C();
i2c.setup({ scl: __CONFIG__.SCLPin, sda: __CONFIG__.SDAPin, bitrate: 400000 });

// Create display instance
const display = SSD1306.connect(i2c, function() {
    // Get the image
    const img = ImagesData.getImage('wifi');

    // Draw the image
    display.drawImage(img, 0, 0);
    display.flip();
});
```

Running the example app
=======================

Requirements
------------

- ESP8266 (NodeMCU) with espruino firmware
- SSD1306 dosplay connected to I2C

Steps
-----

1. Configure device parameters in `config/env-config.yaml`
2. Upload static data:
```
cd static-data
node flash-files.js                 ## Uploads files to flash in device
node generate-file-descriptors.js   ## Generate importable descriptors
```
3. Build application in debug mode to check output: `npm run build-debug`
4. After visually checking output, upload to espruino: `npm run upload`

You should see the clock running in your display!!!

