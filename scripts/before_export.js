const fs = require('fs');
let path = __dirname + '/../constants/Config';

console.log("Reading current config ("+path+")")

let config = require(__dirname + '/../constants/Config');
config.apiUrl = process.env.CORE_API_URL || config.apiUrl;
config.alertUrl = process.env.ALERT_URL || config.alertUrl;

console.log("Writing new config ("+path+")")

fs.writeFileSync(path + '.js', "module.exports = " + JSON.stringify(config,null, '   '))

console.log('CONFIG : ', require(__dirname + '/../constants/Config'))
