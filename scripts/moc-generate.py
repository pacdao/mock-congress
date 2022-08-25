import glob
import hashlib
import json
import os
import random
import re
from io import BytesIO

import requests
from PIL import Image


class MOC:
    base_dir = "untrimmed-assets/"
    extension = ".png"
    male_only = ["shirt", "jacket", "tie", "beard"]
    female_only = ["cardigan", "jacket", "necklace"]
    moc_hash = None
    slots = [
        "head",
        "wrinkles",
        "eyes",
        "iris",
        "nose",
        "whiskers",
        "shirt",
        "jacket",
        "tie",
        "beard",
        "cardigan",
        "jacket",
        "necklace",
        "mouth-type",
        "mouth-color",
        "glasses",
        "hair-color",
        "hair-type",
        "background",
        "hedscarf-",
        "whiskers",
        "mustache-1",
    ]
    hairstyles = [
        "receding-hair",
        "female-long",
        "generic-male",
        "short-female",
        "bob",
        "wavy-hair",
        "head-fuzz",
    ]
    mouth_types = [
        "thin-mouth",
        "negative-mouth",
        "serious-smile",
        "smirk-teeth",
        "smirk",
        "normal-tooth-mouth",
        "mouth-smiling",
    ]
    offset = 0
    show_preview = True

    def add_bg(self, data):
        filehandle = self.select_slot(
            self.retrieve_mapping("background"), data, "background"
        )
        bg = Image.open(self.base_dir + filehandle + self.extension)
        return bg

    def add_layer(self, img, data, mode):
        if mode == "mouth":
            slot = self.select_slot(self.mouth_types, data, "mouth-type")
            if int(data["id"]) in self.moc_range(-5, -3.5):
                slot = "negative-mouth"
            mapping = self.retrieve_mapping(slot)
            mode = "mouth-color"
        elif mode == "hair":
            slot = self.select_slot(self.hairstyles, data, "hair-type")
            mapping = self.retrieve_mapping(slot)
            mode = "hair-color"
        else:
            mapping = self.retrieve_mapping(mode)

        filehandle = self.select_slot(mapping, data, mode)
        if filehandle is not None:
            layer = Image.open(self.base_dir + filehandle + self.extension)
            img.paste(layer, (0, 0, layer.size[0], layer.size[1]), layer)
        return img

    def retrieve_mapping(self, layer_mode):
        retdict = {}
        if layer_mode == "glasses":
            files = glob.glob(self.base_dir + "*Glasses" + self.extension)
            for f in files:
                retdict[f] = f.replace(self.base_dir, "").replace(self.extension, "")
            return retdict

        files = glob.glob(self.base_dir + "*" + layer_mode + self.extension)
        if len(files) == 0:
            print("Trouble", layer_mode)
            print(self.base_dir + "*" + layer_mode + self.extension)
        for f in files:
            mod_f = f.replace(self.base_dir, "").replace(self.extension, "")
            result = re.search(r"\d_(.*)-" + layer_mode + "$", mod_f)
            retdict[result.group(1)] = mod_f
        return retdict

    def generate_hash(self, data, counter):

        m = hashlib.sha256()
        m.update(str(f"{counter}").encode())
        m.update(str(data).encode())
        return m.hexdigest()

    def validate_hash(self, hashed, data):
        if len(self.load_numbers(hashed)) < len(self.slots):
            return False

        haircolor = data["dna"]["hairFinal"]
        if data["dna"]["facialHair"] == "Beard":
            beard = self.retrieve_value_deterministic(
                "beard", self.load_numbers(hashed)
            )
            if haircolor == "Gray" and not any(
                ext in beard for ext in ["white", "grey"]
            ):
                return False

        if data["dna"]["facialHair"] == "Moustache":
            moustache = self.retrieve_value_deterministic(
                "mustache-1", self.load_numbers(hashed)
            )
            # print("ST", haircolor, data['dna']['facialHair'], moustache)
            if "Gray" in haircolor and not any(
                ext in moustache for ext in ["white", "grey"]
            ):
                return False
            if "Black" in haircolor and not any(
                ext in moustache for ext in ["black", "grey", "brown"]
            ):
                return False

        wrinkles = data["dna"]["wrinkles"]
        if wrinkles == "Mild":
            if "heavy" in self.retrieve_value_deterministic(
                "wrinkles", self.load_numbers(hashed)
            ):
                return False

        hair_color = data["dna"]["hairFinal"]
        hair_style = data["dna"]["hairstyleFinal"]

        _hairstyle = self.retrieve_value_deterministic(
            "hair-type", self.load_numbers(hashed), self.hairstyles
        )
        if hair_style == "Female Short" and _hairstyle != "short-female":
            return False
        if hair_style == "Female Long" and _hairstyle != "female-long":
            return False
        if hair_style == "Female Bob" and _hairstyle != "bob":
            return False
        if hair_style == "Generic Short" and _hairstyle not in [
            "generic-male",
            "wavy-hair",
        ]:
            return False
        if hair_style == "Generic Male Medium" and _hairstyle not in [
            "generic-male",
            "wavy-hair",
        ]:
            return False

        if hair_style == "Bald" and _hairstyle != "head-fuzz":
            return
        if hair_style == "Receding Hairline" and _hairstyle not in [
            "receding-hair",
            "generic-male",
            "head-fuzz",
            "wavy-hair",
        ]:
            return False
        _haircolor = self.retrieve_value_deterministic(
            "hair-color", self.load_numbers(hashed), self.retrieve_mapping(_hairstyle)
        )
        if "Blonde" in hair_color and "yellow" not in _haircolor:
            return False
        if "Brown" in hair_color and any(
            l in _haircolor for l in ["yellow", "white", "red"]
        ):
            return False
        _skin = self.retrieve_value_deterministic("head", self.load_numbers(hashed))
        if data["dna"]["skinShade"] == "White" and any(
            l in _skin for l in ["brown", "black"]
        ):
            return False

        eye_color = data["dna"]["eyes"]
        _eyecolor = self.retrieve_value_deterministic("iris", self.load_numbers(hashed))

        if "brown" in eye_color and any(
            l in _eyecolor for l in ["green", "blue", "turquoise"]
        ):
            return False

        if "brown" in _eyecolor and "green" in eye_color:
            return False

        if "blue" in eye_color and any(
            l in _eyecolor for l in ["green", "brown", "hazel"]
        ):
            return False

        face = self.retrieve_value_deterministic("head", self.load_numbers(hashed))

        # Hair does not fit on face
        if "receding" in _haircolor and "pink" in face:
            return False
        if "Light Brown" in hair_color and "light-brown" not in _haircolor:
            return False

        if "Black" in hair_color and not any(
            l in _haircolor for l in ["black", "dark"]
        ):
            return False

        if "Gray" in hair_color and any(
            l in _haircolor for l in ["yellow", "brown", "black", "red"]
        ):
            return False

        if "Red" in hair_color and "red" not in _haircolor:
            return False

        _smile = self.retrieve_value_deterministic(
            "mouth-type", self.load_numbers(hashed), self.mouth_types
        )

        # print(_smile, 'negative-mouth', _smile == 'negative-mouth')
        colors = self.get_party_shading(data, self.load_numbers(hashed))
        if colors != data["party"]:
            return False
        if int(data["id"]) in self.moc_range(-3.5, 5) and _smile == "negative-mouth":
            # print("Here")
            return False
        #        if _smile != 'negative-mouth':
        #            return False

        # print(self.retrieve_value_deterministic('beard', self.load_numbers(hashed)))
        return True

    def get_color(self, string):
        result = re.search(r"s_\d{4}_([^-]*)-", string)
        return result.group(1)

    def get_party_shading(self, data, numbers):
        self.sp("--\n")
        blue = 0
        red = 0
        vals = {
            "head": 4,
            "jacket": 4,
            "tie": 2,
            "shirt": 3,
            "iris": 1,
            "nose": 2,
            "background": 8,
        }
        traits = ["head", "iris", "nose", "background"]
        if data["gender"] == "M":
            traits += self.male_only
        else:
            traits += self.female_only
        for j in traits:

            if j == "mouth-color":
                color = self.get_color(self.retrieve_value_deterministic(j, numbers))
            else:
                color = self.get_color(self.retrieve_value_deterministic(j, numbers))
            if j in vals:
                val = vals[j]
            else:
                val = 1
            if color in ["blue", "cool", "warm", "turquoise"]:
                self.sp(f"{j} {color} {val} hardblue")
                blue += val * 2
            elif color in ["green"]:
                self.sp(f"{j} {color} {val} blue")
                blue += val
            elif color in ["orange", "pink", "yellow"]:
                self.sp(f"{j} {color} {val} red")
                red += val
            elif color in ["red", "pink"]:
                self.sp(f"{j} {color} {val} hardred")
                red += val * 2
            else:
                self.sp(f"{j} {color} neutral")

        self.sp(f"red {red} vs blue {blue}")
        if red > 15 and blue < 5:
            return "R"
        if blue > 15 and red < 5:
            return "D"
        return "I"

    def load_hash(self, data):
        if self.moc_hash is not None:
            return self.moc_hash

        counter = 0
        while True:
            current_hash = self.generate_hash(data, counter)
            if self.validate_hash(current_hash, data) == True:
                self.moc_hash = current_hash
                if self.offset == 0:
                    return current_hash
                else:
                    self.offset -= 1

            counter += 1
            if counter > 20000:
                print("Failed to retrieve hash")
                assert False
                break

    def load_numbers(self, h):
        chars = list("abcdef")
        results = []
        for s in h:
            if s in chars:
                results.append(10 + chars.index(s))
            else:
                results.append(int(s))
        return results

    #    regexp = re.search(r"(\d)", h)
    #    results = re.findall(r"(\d)", h)
    #    return results

    def select_slot(self, faces, data, mode):

        if len(faces) > 16:
            print("Too many faces")
            print(len(faces))
            print(mode)
            print(faces)
            print(data)
            assert False
        numbers = self.load_numbers(self.load_hash(data))

        if mode == "mustache-1" and data["dna"]["facialHair"] not in ["Moustache"]:
            return None

        if mode == "beard" and data["dna"]["facialHair"] not in ["Beard", "Goatee"]:
            return None

        return self.retrieve_value_deterministic(mode, numbers, faces)

    def retrieve_value_deterministic(self, mode, numbers, faces=None):
        if faces is None:
            faces = self.retrieve_mapping(mode)
        try:
            thelist = list(faces.values())
        except:
            thelist = faces
        index = self.slots.index(mode)
        hash_result = numbers[index]
        if len(thelist) == 0:
            print("AT ZERO", mode)
            print(faces)
            print(thelist)
            print(hash_result)
            print(index)
        mod_index = hash_result % len(thelist)
        return thelist[mod_index]

    def generate_moc(self, data, filepath=None):
        img = self.add_bg(data)
        img = self.add_layer(img, data, "head")
        if data["dna"]["wrinkles"] != "No":
            img = self.add_layer(img, data, "wrinkles")
        img = self.add_layer(img, data, "eyes")
        img = self.add_layer(img, data, "iris")
        img = self.add_layer(img, data, "nose")
        if data["gender"] == "M":
            # img = self.add_layer(img, data, 'whiskers')
            img = self.add_layer(img, data, "shirt")
            img = self.add_layer(img, data, "jacket")
            img = self.add_layer(img, data, "tie")
            img = self.add_layer(img, data, "beard")
            img = self.add_layer(img, data, "mustache-1")
        else:
            img = self.add_layer(img, data, "cardigan")
            img = self.add_layer(img, data, "jacket")
            img = self.add_layer(img, data, "necklace")

        img = self.add_layer(img, data, "mouth")
        # print(data['dna']['misc'])
        if data["dna"]["misc"] == "Glasses":
            # print("Glasses")
            img = self.add_layer(img, data, "glasses")

        if data["dna"]["hairstyleFinal"] == "Bald" and data["gender"] == "Female":
            pass
        elif data["dna"]["hairstyleFinal"] == "Headscarf":
            img = self.add_layer(img, data, "hedscarf-")
        else:
            img = self.add_layer(img, data, "hair")

        layer = Image.open(self.base_dir + "bg-overlay-4.png")
        img.paste(layer, (0, 0, layer.size[0], layer.size[1]), layer)

        if self.show_preview:
            img.show()

        response = requests.get(data["img"])

        if self.show_preview:
            img2 = Image.open(BytesIO(response.content))
            img2.show()
        if filepath is not None:
            output = img.save(filepath)
        # output = img.save("moc_generated.png")

    def generate_specific_moc(self, moc, filename=None):
        f = open("../assets/ipfsdata.json")
        data = json.load(f)

        for i in data:  # .json():
            if i["name"] == moc or str(i["id"]) == str(moc):
                # for j in range(5):
                self.generate_moc(i, filename)

    def clean_files(self):
        for i in os.listdir(self.base_dir):
            rep = re.sub(r"eye\.png*", "eyes.png", i)
            if i != rep:
                cmd = f"mv {self.base_dir}{i} {self.base_dir}{rep}"
                os.system(cmd)
            rep2 = re.sub(r"eyes.\.png", "eyes.png", i)
            if i != rep2:
                cmd = f"mv {self.base_dir}{i} {self.base_dir}{rep2}"
                os.system(cmd)

    def clean_more(self):
        # Remove copies
        rep = re.sub(r"-copy-\d*", "", i)
        if i != rep:
            cmd = f"mv {self.base_dir}{i} {self.base_dir}{rep}"
            os.system(cmd)

        # Smirks
        rep = re.sub(r"-smirk-teeth", "", i)

    def moc_range(self, from_val, to_val):
        retdict = []
        for k in self.moc_data.json():
            if from_val <= self.moc_data.json()[k]["overall_score"] <= to_val:
                retdict.append(int(k))
        return retdict

    def sp(self, item):
        pass

    def __init__(self):
        self.moc_data = requests.get("http://dev.curvemarketcap.com/get_votes")


url = "https://bafybeiem2mkeps5zlts7aes2soqk53bbw7ue2fw3qnd5vyiwc6we4hd5tm.ipfs.dweb.link/"
data = requests.get(url)
for j in data.json():
    for i in range(3):
        M = MOC()
        M.offset = i
        M.show_preview = False
        filename = f"draft/{j['id']}-{i}-{j['name']}.png"
        print(filename)
        if not os.path.exists(filename) and j["id"] != 455:
            try:
                M.generate_specific_moc(j["id"], filename)
            except Exception as e:
                print("Error")
                print(e)


