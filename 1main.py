import logging
import tkinter as tk
import customtkinter

from all_graph import one_graph_all_param, non_truncate, truncate_plot, two_file_plot_data
from constants import INPUT_BTN_LIST, INPUT_VALUES, SPIRAL_CSV_FILE
from spiral import plot_csv_file, spiral, x_axis_rrotat, xy_rotate, y_axis_rrotat
from tools import find_json_value, read_json, save_as_json, save_to_csv, update_json
from ui_helper import create_entry, open_file_dialog


logging.basicConfig(filename='api_errors.log', level=logging.ERROR, 
                    format='%(asctime)s %(levelname)s %(message)s')

customtkinter.set_appearance_mode("Light")  # Modes: "System" (standard), "Dark", "Light"
customtkinter.set_default_color_theme("blue")  # Themes: "blue" (standard), "green", "dark-blue"

# Create the main window
app = customtkinter.CTk()
app.geometry("800x640")
app.title("3D Model Generator")
frame1 = customtkinter.CTkFrame(master=app, width=280, height=280)
frame1.pack(side="left", padx=10, pady=10, expand=True, fill="both")

# Add a label to Frame 1
label1 = customtkinter.CTkLabel(master=frame1, text="Actions")
label1.pack(pady=20)

# Create Frame 2
frame2 = customtkinter.CTkFrame(master=app, width=280, height=280)
frame2.pack(side="left", padx=10, pady=10, expand=True, fill="both")

# Add a label to Frame 2
label2 = customtkinter.CTkLabel(master=frame2, text="Settings")
label2.pack(pady=20)


def show_selected_item(selected_item):
    csv_file = find_json_value(INPUT_VALUES,"selected_file")
    if selected_item == "All":
        csv_file = find_json_value(INPUT_VALUES,"selected_file")
        one_graph_all_param(file=csv_file)

    elif selected_item == "Truncate Plot":
        truncate_plot(file=csv_file,truncate_frame=90)

    elif selected_item == "Non-Truncate Plot":
        non_truncate(file=csv_file)

    elif selected_item == "Two files plot":
        t_file = [csv_file,csv_file]
        two_file_plot_data(two_files= t_file)

    elif selected_item == "Choose csv file":
        open_file_dialog(frame2)

    elif selected_item == "Generate_X_Rotate":
        resolution,total_h,base_h, angle_ = load_va()
        spiral_data = x_axis_rrotat(angle=angle_,resolution=resolution,base_height=base_h,total_height=total_h)
        save_to_csv(spiral_data,SPIRAL_CSV_FILE)
        plot_csv_file(SPIRAL_CSV_FILE)

    
    elif selected_item == "Generate_Y_Rotate":
        resolution,total_h,base_h, angle_ = load_va()
        spiral_data = y_axis_rrotat(angle=angle_,resolution=resolution,base_height=base_h,total_height=total_h)
        save_to_csv(spiral_data,SPIRAL_CSV_FILE)
        plot_csv_file(SPIRAL_CSV_FILE)

    elif selected_item == "Generate_XT_Rotate":
        resolution,total_h,base_h, angle_ = load_va()
        spiral_data = xy_rotate(angle=angle_,resolution=resolution,base_height=base_h,total_height=total_h)
        save_to_csv(spiral_data,SPIRAL_CSV_FILE)
        plot_csv_file(SPIRAL_CSV_FILE)

    elif selected_item == "Generate_3D_CSV":
        resolution,total_h,base_h, angle_ = load_va()
        spiral_data = spiral(resolution=resolution,base_height=base_h,total_height=total_h)
        save_to_csv(spiral_data,SPIRAL_CSV_FILE)
        plot_csv_file(SPIRAL_CSV_FILE)
    
    elif selected_item == "Plot CSV":
        plot_csv_file(SPIRAL_CSV_FILE)

    elif selected_item == "Exit":
        global app
        app.destroy()
    else:
        logging.info(f"You selected: {selected_item}")
        #label.config(text="You selected: " + selected_item)

def load_va():
    total_h = updating_value("total_h")
    angle_ = updating_value("anglr_")
    base_h = updating_value("base_h")
    resolution = updating_value("reso")
    coil_radius = updating_value("coil_radius")
    return resolution,total_h,base_h, angle_

my_list ={}

def create_labeled_entry(frame, label_text,json_key):
    r1 = tk.Frame(frame)
    entry = create_entry(r1,json_key)
    my_list[json_key]= entry

    # btn = tk.Button(r1, text=label_text, font=("Arial", 12), width=20, command=lambda item=label_text: update_json(INPUT_VALUES,json_key,entry.get()))
    # btn.grid(row=1,column=3)
    
    r1.pack(pady=10)
    return r1

def updating_value(key):
    if key in my_list:
        tata = my_list[key].get()
        try:
            # Attempt to convert the string to an integer to ensure type consistency
            int_value = float(tata)
        except ValueError:
            # If conversion fails, store the original string
            int_value = tata

        update_json(INPUT_VALUES,key, int_value)
    return int_value

button_list_items = [
    "Choose csv file",
    "All", 
    "Truncate Plot", 
    "Non-Truncate Plot", 
    "Two files plot", 
    "Generate_X_Rotate", 
    "Generate_Y_Rotate", 
    "Generate_XT_Rotate", 
    "Generate_3D_CSV", 
    "Plot CSV", 
    "Exit"
]

default_input_list = {
    "Resolution":"reso",
    "Angle":"anglr_",
    "Coil_radius":"coil_radius",
    "Base_height":"base_h",
    "Total_height":"total_h"
}

# Create buttons for each item
for item in button_list_items:
    button = customtkinter.CTkButton(
        master=frame1,
        text=item,
        command=lambda i=item: show_selected_item(i),
        width=120,
        height=32,
        corner_radius=8,
        hover_color="darkblue"
    )
    button.pack(pady=5)

    ##button = tk.Button(frame1, text=item, font=("Arial", 12), width=20, command=lambda item=item: show_selected_item(item))
    ##button.pack(pady=5)

if read_json(INPUT_BTN_LIST) == []:
    save_as_json(default_input_list,INPUT_BTN_LIST)

input_list_items = read_json(INPUT_BTN_LIST)

for key in input_list_items:
    valu = input_list_items[key]
    create_labeled_entry(frame=frame2, label_text=key, json_key=valu)
    

# Run the tkinter main loop
app.mainloop()
