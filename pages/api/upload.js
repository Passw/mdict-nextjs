import {IncomingForm} from 'formidable'
// you might want to use regular 'fs' and not a promise one
import {promises as fs} from 'fs'
const mdictFinder = require("../../utils/mdict-finder").mdictFinder


// first we need to disable the default body parser
export const config = {
    api: {
        bodyParser: false,
    }
};

export default async (req, res) => {
    console.log("api/upload called")
    if (req.method === "POST") {
        // parse form with a Promise wrapper
        const data = await new Promise((resolve, reject) => {
            const form = new IncomingForm({
                multiples: true,
                keepExtensions: true,
            });
            form.parse(req, (err, fields, files) => {
                if (err) return reject(err)
                resolve({fields, files})
            })
        })
        let fp = []
        for (const f of data.files.file) {
            const buffer = await fs.readFile(f.path)
            let arraybuffer = Uint8Array.from(buffer).buffer
            arraybuffer.name = f.name
            fp = [
                ...fp,
                arraybuffer,
            ]
        }
        const fileList = fp
        const word = "pa"
        const content = await mdictFinder(fileList, word)
        console.log({content})

    }
}