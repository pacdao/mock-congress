import requests
from bs4 import BeautifulSoup

url = "https://en.wikipedia.org/wiki/List_of_current_members_of_the_United_States_House_of_Representatives"
r = requests.get(url)
html_doc = r.text
soup = BeautifulSoup(html_doc, "html.parser")

c = 0
data = {}
for t in soup.find_all("table"):

    for s in t.find_all("img"):
        parent = s.parent.parent.parent
        td = s.parent.parent.parent.find("td")
        name = None
        try:
            name = td["data-sort-value"]
        except:
            pass

        if name is not None:
            if name in data:
                print("Already there", name)
            else:
                data[name] = s["src"]

for k, d in data.items():
    print(k, d)
