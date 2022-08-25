import csv
import json
import os
import re
from pprint import pprint

import pandas as pd
import requests
from dotenv import load_dotenv

load_dotenv()
pinata_key = os.getenv("PINATA_KEY")
pinata_secret = os.getenv("PINATA_SECRET")

json_object = requests.get(url="https://curvemarketcap.com/get_votes").json()

dumped_json = json.dumps(json_object, indent=4)

ipfs_url = "https://api.pinata.cloud/pinning/pinJSONToIPFS"
headers = {"pinata_api_key": pinata_key, "pinata_secret_api_key": pinata_secret}

files = [
    ("moc", ("moc.json", dumped_json)),
]

response = requests.get(
    url="https://api.pinata.cloud/data/pinList?status=pinned&pageLimit=1000",
    headers=headers,
).json()["rows"]

obj = {}
for k in response:
    ipfs_hash = k["ipfs_pin_hash"]
    name = k["metadata"]["name"]
    if name is None:
        continue
    if name[0:5] == "draft":
        p = re.compile("draft/(\d*)-(\d*)-(.*).png")
        matches = re.search(p, name)
        this_key = matches[3]
        if this_key not in obj:
            obj[this_key] = {}

        obj[this_key][matches[2]] = {"hash": ipfs_hash, "name": name}

# print(obj.keys())


def pin_to_ipfs(p1, p2, p3):
    filename = f"draft/{p1}-{p2}-{p3}.png"
    url = "https://api.pinata.cloud/pinning/pinFileToIPFS"
    headers = {"pinata_api_key": pinata_key, "pinata_secret_api_key": pinata_secret}
    payload = {
        "pinataOptions": '{"cidVersion": 1}',
        "pinataMetadata": '{"name": "' + filename + '"}',
    }

    files = [("file", (filename, open(filename, "rb"), "application/octet-stream"))]
    print(filename)
    response = requests.request("POST", url, headers=headers, data=payload, files=files)
    return
    if os.path.exists(filename):
        pass
    else:
        print(filename)
        print("F")
        assert False


f = open("ipfs.csv", "w")
writer = csv.writer(f)

for j, data in json_object.items():
    img = data["thumbnails"][0]
    row_id = data["id"]
    name = data["name"]

    if data["incumbent"] != True:
        continue

    q = re.compile("curvemarketcap\.com/[A-z]*/([^/]*)/([^/*])/(.*).png")

    matches = re.search(q, img)
    match_key = matches[1]
    offset = matches[2]

    if name in obj:
        if offset in obj[name]:
            o = obj[name][offset]
            writer.writerow([row_id, name, offset, obj[name][offset]])
            pass
        else:
            pin_to_ipfs(match_key, offset, name)
    else:
        pin_to_ipfs(match_key, offset, name)


assert False

if False:
    response = requests.post(url=ipfs_url, json=output, headers=headers)
    print(response.json())
else:
    pprint(output)
