#!/bin/bash -e
./_build.py
rsync -Pavz built/* shithouse.tv:/var/www/burrito/ &
rsync -Pavz static shithouse.tv:/var/www/burrito &
if [[ "$1" ]]; then
    if [[ "$1" == "-p" ]]; then
        git commit -p
        git push
    fi
fi
