export type StaticDataStruct = {
    name: string,
    width: number,
    height: number,
    bpp: number,
    transparent: number,
    flashId: number
}

/**
 * StaticData class. Used to retrieve data from the Flash Storage using the Espruino Storage module.
 *
 */
class StaticData {
    dataDefs: Object;

    constructor(dataDefs: Object) {
        this.dataDefs = dataDefs;
    }

    getImage(name: string) {
        const def = this.dataDefs[name];
        return {
            width: def.width,
            height: def.height,
            bpp: 1,
            transparent: 0,
            buffer: new Uint8Array(require('Storage').readArrayBuffer(name)).buffer
        }
    }
}

export default StaticData;