from pathlib import Path
import logging
import sys
import traceback
import yaml


def load_config(path):
    for pth in Path(path).iterdir():
        if pth.suffix == ".yaml":
            with pth.open() as f:
                try:
                    d = yaml.load(f)
                    name = pth.stem
                    d["name"] = name
                    yield (name, d)
                except:
                    print("Could not open {}", pth)
                    error = traceback.format_exc()
                    print(error)

def get_logger():
    lg = logging.getLogger()
    lg.setLevel(logging.DEBUG)
    if not lg.handlers:
        handler = logging.StreamHandler(sys.stdout)
        # handler.setLevel(logging.DEBUG)
        formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        handler.setFormatter(formatter)
        lg.addHandler(handler)
        print(lg.handlers)
    return lg
