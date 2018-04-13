/**
 * This are the type definitions for the file.
 *
 * By decalring __CONFIG__ type you can autocomplete it.
 * Every prop there will later (in bundling time) be
 * replaced by it's value (avoiding a bunch of variables in espruino code)
 */
declare type __CONFIG__ = {
    pins: {
        sclPin: Pin,
        sdaPin: Pin,
    },

    // Your network name and password.
    wifi: {
        ssid: string,
        password: string,
    },
}

declare var __CONFIG__:__CONFIG__;