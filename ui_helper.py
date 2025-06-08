import os
import tkinter as tk
from tkinter import filedialog
import pandas as pd

from constants import *
from tools import *

logger = setup_logger(logger=logging.getLogger(__name__))

def double_backslashes(input_string):
    return input_string.replace('\\', '\\\\')

def read_csv(file_path):
    if os.path.exists(file_path):
        return pd.read_csv(file_path)
    
    if not os.path.exists(file_path):
        logger.error("File not found. Please provide a valid file path.")

def read_csv_two(file_paths):
    data = [None,None]
    data[0] = pd.read_csv(file_paths[0])
    data[1] = pd.read_csv(file_paths[1])
            
    return data

def open_file_dialog(master):
    file_path = filedialog.askopenfilename(
        title="Select a JSON File",
        filetypes=[("JSON files", "*.json"), ("All files", "*.*")]
    )
    if file_path:
        logger.info(f"Selected file: {file_path}")
        update_json(INPUT_VALUES,"selected_file",file_path)
        #load_settings(master,file_path)


def create_labeled_entry(frame, label_text,json_key):
    r1 = tk.Frame(frame)
    read_da = read_json(INPUT_VALUES)
    entry_var = tk.StringVar(value=json_key)
    if find_json_value(read_file=INPUT_VALUES,key=json_key) is not None:
        entry_var = tk.StringVar(value=read_da[json_key])  # Create a StringVar with not　the default value

    entry = tk.Entry(master=r1,textvariable=entry_var)
    entry.grid(row=1,column=1, columnspan=2)

    btn = tk.Button(r1, text=label_text, font=("Arial", 12), width=20, command=lambda item=label_text: update_json(INPUT_VALUES,json_key,entry.get()))
    btn.grid(row=1,column=3)
    
    r1.pack(pady=10)
    return r1

