import {IncomingForm} from 'formidable'
// you might want to use regular 'fs' and not a promise one
import {promises as fs} from 'fs'

const {JSDOM} = require("jsdom")
const {window} = new JSDOM("")
const $ = require("jquery")(window)
const MParser = require("../../utils/mdict-parser").pa
const MRenderer = require("../../utils/mdict-renderer").ren

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
        // read file from the temporary path
        // const contents = await fs.readFile(data?.files?.file.path, {
        //     encoding: 'utf8',
        // })
        // contents is a string with the content of uploaded file, so you can read it or store
        // const result = data.files.file
        // console.log({contents})
        let fp = []
        for (const f of data.files.file) {
            const buffer = await fs.readFile(f.path)
            // const blobLIKE = new File([buffer], f.name)
            let arraybuffer = Uint8Array.from(buffer).buffer
            arraybuffer.name = f.name
            fp = [
                ...fp,
                arraybuffer,
            ]
        }
        console.log({fp})
        const fileList = fp

        MParser(fileList).then(function (resources) {
            var mdict = MRenderer(resources);

            function doSearch(phrase, offset) {
                console.log("doSearch...")
                console.log(phrase + '');
                mdict.lookup(phrase, offset).then(function ($content) {
                    // $('#definition').empty().append($content.contents());
                    console.log("$content", $content.html())
                    console.log("$content.contents().html()", $content.contents().html())
                    console.log('--');
                });
            }


            const title = (resources['mdx'] || resources['mdd']).value().description || '** no description **'
            console.log({title})
            // $('#dict-title').html((resources['mdx'] || resources['mdd']).value().description || '** no description **');
            // mdict.render($('#dict-title'));

            const query = "chasten"
            mdict.search({phrase: query, max: 5000}).then(function (list) {
                console.log(list.join(', '));
                // TODO: filter candidate keyword starting with "_"
                list = list.map(function (v) {
                    return {word: v, value: v.offset};
                });
                console.log("list[0]", list[0])
                const item = list[0]
                const value = item.word
                doSearch(value, value.offset)
                // $('#word').val(value)
            })

            $('#btnLookup')
                .attr('disabled', false)
                .off('.#mdict')
                .on('click.#mdict', function () {
                    doSearch($('#word').val());
                }).click();

            // $('#word')[0].selectize.destroy();
            //
            // $('#word').selectize({
            //     plugins: ['restore_on_backspace'],
            //     maxItems: 1,
            //     maxOptions: 1 << 20,
            //     valueField: 'value',
            //     labelField: 'word',
            //     searchField: 'word',
            //     delimiter: '~~',
            //     loadThrottle: 10,
            //     create: function (v, callback) {
            //         return callback({word: v, value: v});
            //     },
            //     createOnBlur: true,
            //     closeAfterSelect: true,
            //     allowEmptyOption: true,
            //     score: function (search) {
            //         var score = this.getScoreFunction(search);
            //         return function (item) {
            //             return 1;
            //         };
            //     },
            //     load: function (query, callback) {
            //         var self = this;
            //         if (!query.length) {
            //             this.clearOptions();
            //             this.refreshOptions();
            //             return;
            //         }
            //
            //         mdict.search({phrase: query, max: 5000}).then(function (list) {
            //             //                  console.log(list.join(', '));
            //             // TODO: filter candidate keyword starting with "_"
            //             list = list.map(function (v) {
            //                 return {word: v, value: v.offset};
            //             });
            //             self.clearOptions();
            //             callback(list);
            //         });
            //     },
            //     onChange: function (value) {
            //         var item = this.options[value];
            //         if (item) {
            //             var value = item.word;
            //             doSearch(value, value.offset);
            //             $('#word').val(value);
            //         } else {
            //             $('#definition').empty();
            //         }
            //     },
            // });
        })

    }
}