import json
import os
import re

metadata = {}
basedir = "metadata/"

full_set = list(range(541))
our_set = []
for i in os.listdir(basedir):
    try:
        f = open(basedir + i)
        jsondata = json.load(f)
        f.close()
        our_set.append(int(i))
        for attr in jsondata["attributes"]:
            if attr["trait_type"] == "District":
                continue

            if attr["trait_type"] not in metadata:
                metadata[attr["trait_type"]] = {}

            if attr["value"] not in metadata[attr["trait_type"]]:
                metadata[attr["trait_type"]][attr["value"]] = 1
            else:
                metadata[attr["trait_type"]][attr["value"]] += 1

    except Exception as e:
        print(f"{i} {e}")

print(json.dumps(metadata, indent=4))
