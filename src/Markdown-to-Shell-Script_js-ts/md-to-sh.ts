const fs = require("fs");
const file = process.argv.slice(2)[0];
const filename = file.split(".")[0];
const filetype = file.split(".")[1];
const md_types = [
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
const supported: boolean = md_types.includes(filetype);

if (!supported) {
  console.log("The filetype is not supported, make sure your file is a markdown file.");
  process.exit(1)
}

fs.readFile(file, "utf8", (err: any, data: string) => {
  const lines = data.split(/\r?\n/);
  if (err) {
    console.error(err);
    return;
  }

  let shebang: string;
  let regex = /#![a-zA-Z0-9/]+(?: [a-zA-Z0-9]+)?/g;

  lines.forEach((curr_line) => {
    let line = curr_line.toString();
    if (line.match(regex)) {
      shebang = line.toString();
    }
  });

  let shebang_type = shebang.includes(" ");
  let shell: string;

  if (!shebang_type) {
    let i = shebang.lastIndexOf("/");
    shell = i > 0 ? shebang.substring(i + 1) : shebang;
  } else {
    let space = shebang.indexOf(" ");
    shell = shebang.substring(space + 1);
  }

  let status = "skip";

  fs.writeFile(filename + ".sh", "", (err: any) => {if (err) throw err});

  lines.forEach(curr_line => {
    let line = curr_line.toString();
    if (line == "```" + shell) {
      status = "script";
    } else if (line == "```" && status == "script") {
      status = "skip";
      fs.appendFile(filename + ".sh", "\n", (err: any) => {if (err) throw err});
    }
    if (status == "script" && line != "```" + shell) {
      fs.appendFile(filename + ".sh", line + "\n", (err: any) => {if (err) throw err});
    }
  });
});