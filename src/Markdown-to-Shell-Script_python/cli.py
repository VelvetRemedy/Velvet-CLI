from os import close, name
import sys
import re

file = sys.argv[1]
filename = sys.argv[1].split(".")[0]
filetype = sys.argv[1].split(".")[1]
md_types = ["markdown", "mdown", "mkdn", "md", "mkd", "mdwn", "mdtxt", "mdtext", "text", "txt", "Rmd"]
supported = md_types.__contains__(filetype)
if not supported: exit()
status = "skip"
regex = re.compile(r'#![a-zA-Z0-9/]+(?: [a-zA-Z0-9]+)?')

filedata = open(file)

shebang = regex.findall(filedata.read())
if shebang[0].__contains__(" "):
    shell = shebang[0].split(" ")[1]
else:
    shell = shebang[0].split("/")[-1]

filedata.close()
filedata = open(file)
output = open(filename + ".sh", "a")

for line in filedata.read().splitlines():
    if line == "```" + shell:
        status = "script"
    elif line == "```" and status == "script":
        status = "skip"
        output.write('\n')

    if status == "script" and line != "```" + shell:
        output.write(line + '\n')

filedata.close()