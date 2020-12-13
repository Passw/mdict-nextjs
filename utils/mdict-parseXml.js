// parseXml = require("./mdict-parseXml").parseXml
const jsdom = require("jsdom")
const { JSDOM } = jsdom
const DOMParser = new JSDOM().window.DOMParser
function parseXml(str) {
    return (new DOMParser()).parseFromString(str, 'text/xml');
}

exports.parseXml = parseXml