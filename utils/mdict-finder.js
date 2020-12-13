const MParser = require("./mdict-parser").pa
const MRenderer = require("./mdict-renderer").ren

async function mdictFinder(fileList, word) {
    return MParser(fileList).then(function (resources) {
        const mdict = MRenderer(resources)
        return mdict.lookup(word).then(function ($content) {
            return $content.html()
        });
    });
}

exports.mdictFinder = mdictFinder