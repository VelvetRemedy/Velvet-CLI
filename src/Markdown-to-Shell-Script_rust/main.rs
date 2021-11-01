use std::env::args;
use std::fs::File;
use regex::Regex;
use std::io::{BufReader, BufRead, Write};

fn main() {
    let args:  Vec<String> = args().collect();
    let file = args[1].to_string();
    let splitename: Vec<&str> = file.split(".").collect();
    let filename = splitename[0];
    let filetype = splitename[1];

    let md_types: [&str; 11] = [
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

    let supported = md_types.contains(&filetype);
    
    if !supported {
        panic!("filetype not supported!");
    }

    let regex = Regex::new(r"#![a-zA-Z0-9/]+(?: [a-zA-Z0-9]+)?").unwrap();

    let data: Vec<String> = to_vec(&file);
    let shell: String = find_shell(&data, regex);
    if shell == "shell not found." {
        panic!("shell not found!");
    }

    export_code(&data, &filename, shell);

}

fn to_vec(file: &String) -> Vec<String> {
    let openfile = File::open(file).unwrap();
    let reader = BufReader::new(openfile);
    let mut data: Vec<String> = Vec::new();
    for (_, line) in reader.lines().enumerate() {
        let line = line.unwrap();
        data.push(line.to_owned());
    }
    data
}

fn find_shell(data: &Vec<String>, regex: Regex) -> String {
    for line in data {
        let shebang: bool = regex.is_match(&line);
        if shebang {
            if line.contains(" ") {
                let shell = line.split(" ").collect::<Vec<&str>>()[1].to_string();
                return shell
            } else {
                let shebang_vec = line.split("/").collect::<Vec<&str>>();
                let len = shebang_vec.len();
                let shell = shebang_vec[len - 1].to_string();
                return shell
            }
        }
    }
    return "shell not found.".to_string()
}

fn export_code(data: &Vec<String>, filename: &str, shell: String) {
    let mut file = File::create(filename.to_string() + ".sh").unwrap();
    let mut status = "skip".to_string();
    for line in data {
        if line.to_string() == "```".to_string() + &shell.to_string() {
			status = "script".to_string();
		} else if line.to_string() == "```".to_string() && status == "script".to_string() {
			status = "skip".to_string();
			writeln!(&mut file, "\n").unwrap();
		}
		if status == "script".to_string() && line.to_string() != "```".to_string() + &shell.to_string() {
        writeln!(&mut file, "{}", line).unwrap();
        }
    }
}