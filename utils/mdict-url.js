// https://github.com/GMartigny/crop-browser/blob/master/test/_set-env.js
const fs = require("fs")
const implSymbol = require("jsdom/lib/jsdom/living/generated/utils.js").implSymbol
const fse = require('fs-extra')

const map = {};
let URL = {}
URL.createObjectURL = async (blob) => {
    console.log({blob})
    const uuid = Math.random().toString(36).slice(2)
    const path = `public/cache/${uuid}`
    fse.ensureFileSync(path)
    fs.writeFileSync(path, Buffer.from(blob))
    const url = `file://cache/${uuid}`
    map[url] = path
    return url
}
URL.revokeObjectURL = async (url) => {
    fs.unlinkSync(map[url])
    delete map[url]
}

exports.URL = URL
