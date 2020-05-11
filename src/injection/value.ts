
var fs = require('fs');

let configFileContent = '{}';
try {
    configFileContent = fs.readFileSync('./config.json', { encoding:'utf8', flag:'r' }); 
} catch (error) { }

const config = JSON.parse(configFileContent);

export function Value(location: string){
    return function(target: Object, propertyName: string) {
        target[propertyName] = getObjectPropertyValue(config, location, location);
    }
}

function getObjectPropertyValue(target: Object, path: string, originalPath: string): any {
    if (!target) {
        console.error(`ERROR: @Value('${originalPath}') NOT FOUND in config.json`);
        return undefined;
    }

    const pathParts = path.split('.');
    if (pathParts.length > 1) {
        return getObjectPropertyValue(target[pathParts[0]], path.substring(path.indexOf('.') + 1), originalPath);
    } else {
        return target[pathParts[0]];
    }
}