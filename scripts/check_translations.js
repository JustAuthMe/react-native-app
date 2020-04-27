const fs = require('fs');
const path = require('path');
const root = __dirname + '/../';

const toScan = ['components', 'constants', 'models', 'screens']

const referenceLocale = require(root+'i18n/translations/en').default;

let errors = [];
let totalTranslates = 0;
function processDir(dirname){
    fs.readdirSync(root+dirname).forEach(file => {
        let currentFilePath = path.join(dirname, file);
        let stat = fs.statSync(currentFilePath);
        if (stat.isFile()) {
            let problems = processFile(root+currentFilePath);
            if(problems.length > 0){
                errors.push({
                    file: currentFilePath,
                    problems
                })
            }
        } else if (stat.isDirectory()) {
            processDir(currentFilePath);
        }
    });

}

function processFile(file){

    let content = fs.readFileSync(file, 'utf8');

    let matches, keys = [];
    let regex = /Translator\.t\(['"]([A-Za-z0-9_.]+)['"]/g;
    while (matches = regex.exec(content)) {
        keys.push(matches[1]);
    }

    let problems = [];
    keys&&keys.forEach(key => {
        let problem = checkExists(key);
        if(problem){
            problems.push(problem);
        }
    });
    if(problems.length){
        console.log("\x1b[33m Problem in : ", file, "\x1b[0m");
    }

    return problems;
}

function checkExists(key){
    totalTranslates++;
    let cursor = referenceLocale;
    let parts = key.split('.');
    parts.forEach(part => {
        if(cursor === undefined){
            return;
        }
        cursor = cursor[part];
    })

    if(cursor === undefined){
        return {key: key, problem: 'Not found'};
    }
    if (typeof cursor !== 'string'){
        return {key: key, problem: 'Not a string'};
    }
    return null;
}

toScan.forEach(dir => {
    processDir(dir);
})

if(errors.length > 0){
    errors.forEach(file => {
        console.log("Problems in : " + file.file);
        console.table(file.problems)
    })

    process.exit(-1);
}else{
    console.log("\x1b[32mOK : "+totalTranslates+" translations analyzed\x1b[0m");
    console.log("\x1b[32mOK : 0 problem detected\x1b[0m");
}

