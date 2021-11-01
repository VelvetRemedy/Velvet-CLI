var fs = require("fs");
var file = process.argv.slice(2)[0];
var filename = file.split(".")[0];
var filetype = file.split(".")[1];
var md_types = [
    "markdown",
    "mdown",
    "mkdn",
    "md",
    "mkd",
    "mdwn",
    "mdtxt",
    "mdtext",
    "text",
    "txt",
    "Rmd",
];
var supported = md_types.includes(filetype);
if (!supported) {
    console.log("The filetype is not supported, make sure your file is a markdown file.");
    process.exit(1);
}
fs.readFile(file, "utf8", function (err, data) {
    var lines = data.split(/\r?\n/);
    if (err) {
        console.error(err);
        return;
    }
    var shebang;
    var regex = /#![a-zA-Z0-9/]+(?: [a-zA-Z0-9]+)?/g;
    lines.forEach(function (curr_line) {
        var line = curr_line.toString();
        if (line.match(regex)) {
            shebang = line.toString();
        }
    });
    var shebang_type = shebang.includes(" ");
    var shell;
    if (!shebang_type) {
        var i = shebang.lastIndexOf("/");
        shell = i > 0 ? shebang.substring(i + 1) : shebang;
    }
    else {
        var space = shebang.indexOf(" ");
        shell = shebang.substring(space + 1);
    }
    var status = "skip";
    fs.writeFile(filename + ".sh", "", function (err) { if (err)
        throw err; });
    lines.forEach(function (curr_line) {
        var line = curr_line.toString();
        if (line == "```" + shell) {
            status = "script";
        }
        else if (line == "```" && status == "script") {
            status = "skip";
            fs.appendFile(filename + ".sh", "\n", function (err) { if (err)
                throw err; });
        }
        if (status == "script" && line != "```" + shell) {
            fs.appendFile(filename + ".sh", line + "\n", function (err) { if (err)
                throw err; });
        }
    });
});
