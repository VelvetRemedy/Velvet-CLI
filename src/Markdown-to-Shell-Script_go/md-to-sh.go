package main

import (
	"bufio"
	"os"
	"regexp"
	"strings"
)

func main() {
	arg := os.Args[1]
	filename := strings.Split(arg, ".")[0]
	filetype := strings.Split(arg, ".")[1]

	md_types := [11]string{"markdown",
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
	}

	if !supported(md_types, filetype) {
		os.Exit(255)
	}

	regex, _ := regexp.Compile(`#![a-zA-Z0-9/]+(?: [a-zA-Z0-9]+)?`)

	var data []string = to_array(arg)
	var shell = find_shell(data, regex)
	if shell == "shell not found" {
		os.Exit(255)
	}

	export_code(data, filename, shell)

}

func supported(md_types [11]string, filetype string) bool {
	for _, ext := range md_types {
		if filetype == ext {
			return true
		}
	}
	return false
}

func to_array(arg string) []string {
	file, _ := os.Open(arg)
	data := []string{}
	filebuffer := bufio.NewScanner(file)
	for filebuffer.Scan() {
		data = append(data, filebuffer.Text())
	}
	file.Close()
	return data
}

func find_shell(data []string, regex *regexp.Regexp) string {
	for _, line := range data {
		shebang := regex.MatchString(line)
		if shebang {
			if strings.Contains(line, " ") {
				shell := strings.Split(line, " ")[1]
				return shell
			} else {
				shebang_arr := strings.Split(line, "/")
				shell := shebang_arr[len(shebang_arr)-1]
				return shell
			}
		}
	}
	return "shell not found"
}

func export_code(data []string, filename string, shell string) {
	output, _ := os.Create(filename + ".sh")
	var status = "skip"
	for _, line := range data {
		if line == "```"+shell {
			status = "script"
		} else if line == "```" && status == "script" {
			status = "skip"
			output.WriteString("\n")
		}
		if status == "script" && line != "```"+shell {
			output.WriteString(line + "\n")
		}
	}
}
