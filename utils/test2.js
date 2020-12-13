// test2 = require("./test2").test5

const a = "test "
function test3(s) {
    return a + s +  " hello world"
}
function test4(s) {
    return test3() + "test4"
}

exports.test5 = test4
