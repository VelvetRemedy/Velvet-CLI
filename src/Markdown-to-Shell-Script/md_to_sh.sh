#!/usr/bin/env bash

LINES=$(wc -l < "$1")
CURR_LINE=1
FILETYPE=$(echo "$1" | awk -F '.' '{print $2}')
MD_TYPES=("markdown" "mdown" "mkdn" "md" "mkd" "mdwn" "mdtxt" "mdtext" "text" "txt" "Rmd")
STATUS=skip
NAME=$(echo "$1" | awk -F '.' '{print $1}')
SHEBANG=$(grep \#! "$1")

if [[ ! ${MD_TYPES[*]} =~ ${FILETYPE} ]]; then
    echo "The filetype is not supported, make sure your file is a markdonw file."
    exit;
fi

if [[ " ${SHEBANG} " =~ "env" ]]; then
    SHELL=$(echo "$SHEBANG" | awk '{print $NF}')
else
    SHELL=$(echo "$SHEBANG" | awk -F '/' '{print $NF}')
fi

printf "" > "$NAME".sh

until [ "$CURR_LINE" -eq "$LINES" ]; do
    LINE_TXT=$(sed -n "$CURR_LINE"p "$1")
    if [ "$LINE_TXT" == "\`\`\`$SHELL" ]; then
        STATUS=script
    elif [ "$LINE_TXT" == "\`\`\`" ] && [ $STATUS == "script" ]; then
        STATUS=skip
        echo "" >> "$NAME".sh
    fi

    if [ $STATUS == "script" ] && [ "$LINE_TXT" != "\`\`\`$SHELL" ]; then
        echo "$LINE_TXT" >> "$NAME".sh
    fi
    CURR_LINE=$((CURR_LINE + 1))
done
