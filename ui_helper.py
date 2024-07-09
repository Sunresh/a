import logging
import os
import customtkinter
import tkinter as tk
from tkinter import filedialog
import pandas as pd

from constants import INPUT_VALUES
from tools import find_json_value, read_json, update_json


def double_backslashes(input_string):
    return input_string.replace('\\', '\\\\')

def read_csv(file_path):
    if os.path.exists(file_path):
        return pd.read_csv(file_path)
    
    if not os.path.exists(file_path):
        logging.error("File not found. Please provide a valid file path.")

def read_csv_two(file_paths):
    data = [None,None]
    data[0] = pd.read_csv(file_paths[0])
    data[1] = pd.read_csv(file_paths[1])
            
    return data

def open_file_dialog(master):
    file_path = filedialog.askopenfilename(
        title="Select a JSON File",
        filetypes=[("CSV files", "*.csv"), ("All files", "*.*")]
    )
    if file_path:
        logging.info(f"Selected file: {file_path}")
        update_json(INPUT_VALUES,"selected_file",file_path)
        #load_settings(master,file_path)


# Function to create entries with unique IDs
def create_entry(frame,json_key):
    read_da = read_json(INPUT_VALUES)
    entry_var = tk.StringVar(value=json_key)
    if find_json_value(read_file=INPUT_VALUES,key=json_key) is not None:
        entry_var = tk.StringVar(value=read_da[json_key])  # Create a StringVar with not　the default value

    labels = tk.LabelFrame(master=frame,text=json_key)
    labels.grid(row=1,column=1, columnspan=2)
    entry = customtkinter.CTkEntry(
        master=labels,
        width=200,
        textvariable=entry_var,
        height=30,
        border_width=2,
        corner_radius=10
    )
    entry.grid(row=1,column=1, columnspan=2)
    return entry
