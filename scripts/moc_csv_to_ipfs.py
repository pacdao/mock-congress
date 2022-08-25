import csv
import json
import os
from pprint import pprint
from re import sub

import pandas as pd
import requests
from dotenv import load_dotenv

load_dotenv()
pinata_key = os.getenv("PINATA_KEY")
pinata_secret = os.getenv("PINATA_SECRET")

data = pd.read_csv("moc.csv")
final = data.drop(columns=["isdupe"])

json_data = final.to_json(orient="records")
json_object = json.loads(json_data)
dumped_json = json.dumps(json_object, indent=4)

ipfs_url = "https://api.pinata.cloud/pinning/pinJSONToIPFS"
headers = {"pinata_api_key": pinata_key, "pinata_secret_api_key": pinata_secret}

files = [
    ("moc", ("moc.json", dumped_json)),
]


def cc(s):
    s = sub(r"(_|-)+", " ", s).title().replace(" ", "")
    return "".join([s[0].lower(), s[1:]])


output = []

for j in json_object:
    _obj = {}
    _dna = {}
    dna_cutoff = 7
    n = 0
    for i, k in j.items():
        _li = cc(i)
        if i == "Incumbent":
            _obj["incumbent"] = True if k.lower() == "y" else False
        elif n > dna_cutoff:
            _dna[_li] = k
        else:
            if _li == "dna":
                _li = "dnaString"
            _obj[_li] = k
        n += 1

    _obj["dna"] = _dna

    output.append(_obj)


if True:
    response = requests.post(url=ipfs_url, json=output, headers=headers)
    print(response.json())
else:
    pprint(output)
