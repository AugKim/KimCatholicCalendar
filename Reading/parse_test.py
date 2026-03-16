import re

with open("/Library/WebServer/Documents/Calendar/Reading/Sunday.js", "r") as f:
    text = f.read()

# Sunday.js starts with: const READINGS_SUNDAY = {
# Let's find out if there are syntax errors. We can try to convert it roughly to json.
js_block = text[text.find("{"):]
js_block = js_block.replace(";", "")
js_block = js_block.strip()
if js_block.endswith("}"):
    print("Found ending curly brace")

# Let's check the size
print("Length:", len(js_block))

# Find basic 4080 existance
if '"4080": {' in js_block:
    print("4080 string is inside!")

