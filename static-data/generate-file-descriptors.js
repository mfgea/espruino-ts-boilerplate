const fs = require('fs');
const files = require('./files');

const flashInstanceName = 'flash';
const imgTemplate = `
{
    "width": __IMAGE_WIDTH__,
    "height": __IMAGE_HEIGHT__
}
`;

const filesObj = files.reduce((accum, file, index) => {
    const obj = JSON.parse(
        imgTemplate
            .replace('__IMAGE_WIDTH__', file.width)
            .replace('__IMAGE_HEIGHT__', file.height)
            .replace('__IMAGE_NAME__', file.name)
    )
    accum[file.name] = obj;
    return accum;
}, {});

fs.writeFileSync('./index.ts', `export default ${JSON.stringify(filesObj)}`);