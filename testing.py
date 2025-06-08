import tkinter as tk

from tools import *

tyu = "tyu.json"

def setting_save(json_key, json_value):
    # Read the current settings
    settings = read_json(tyu)
    # Ensure the settings is a dictionary
    if not isinstance(settings, dict):
        settings = {}
    
    # Update or add the new key-value pair
    settings[json_key] = json_value
    # Save the updated settings back to the file
    save_as_json(settings, tyu)
    logger.info(f"Setting saved: {json_key} = {json_value}")


def create_labeled_entry(frame, label_text,json_key,json_value):
    r1 = tk.Frame(frame)
    
    entry_var = tk.StringVar(value=json_value)  # Create a StringVar with the default value
    entry = tk.Entry(master=r1,textvariable=entry_var)
    entry.grid(row=1,column=1, columnspan=2)

    btn = tk.Button(r1, text=label_text, font=("Arial", 12), width=20, command=lambda item=label_text: setting_save(json_key,entry.get()))
    btn.grid(row=1,column=3)
    
    r1.pack(pady=10)
    return r1

def ladopan():
    root = tk.Tk()
    root.title("Menu of Lists")
    root.geometry("800x600")
    row1 = tk.Frame(root)
    row1.grid(row=1,column=1)
    row2 = tk.Frame(root)
    row2.grid(row=1,column=2)
    sett = read_json('ui_setting.json')
    gre = read_json(tyu)

    for key in sett:
        exval = None
        json_key = sett[key]
        
        # Check if the key exists in the secondary JSON and if its value is None
        if json_key in gre and gre[json_key] is None:
            exval = ""
        elif json_key in gre:
            exval = gre[json_key]
        else:
            exval = None

        create_labeled_entry(frame=row1, label_text=key, json_key=json_key, json_value=exval)

    root.mainloop()