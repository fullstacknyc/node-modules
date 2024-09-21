#!/bin/bash

osascript -e 'tell application "Terminal"
do script "cd Desktop/to-do-list.v1/node_modules &&
node server.js &"
end tell'

osascript -e 'tell application "terminal"
set minituarized of window 1 to true
end tell'

sleep 1

open http://localhost:3000
