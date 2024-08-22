# module.py
import os
import hashlib
import shutil
import networkx as nx
import customtkinter as ctk
from tkinter import StringVar

from matplotlib import pyplot as plt
import pandas as pd


from constants import INPUT_VALUES
from tools.tools import find_json_value, create_listview
from ui_helper import open_file_dialog_t, open_file_dialog


def calculate_hash_helper(file_path, hash_algo=hashlib.md5, chunk_size=4096):
    hash_obj = hash_algo()
    with open(file_path, "rb") as file:
        for chunk in iter(lambda: file.read(chunk_size), b""):
            hash_obj.update(chunk)
    return hash_obj.hexdigest()


def find_duplicate_pdfs_helper( folder="C:/Users/nares/Desktop/LAB/Thesis/３．参考文献(PDF)Reference",):
    pdf_hashes = {}
    duplicates = []

    for root, _, files in os.walk(folder):
        for file in files:
            if file.lower().endswith(".pdf"):
                file_path = os.path.join(root, file)
                file_hash = calculate_hash_helper(file_path)

                if file_hash in pdf_hashes:
                    duplicates.append((file_path, pdf_hashes[file_hash]))
                else:
                    pdf_hashes[file_hash] = file_path

    return duplicates


def search_duplicatePDF(root):
    # Usage example:
    duplicates = find_duplicate_pdfs_helper()
    if duplicates:
        print("Duplicate PDF files found:")
        for duplicate, original in duplicates:
            print(f"Duplicate: {duplicate}\nOriginal: {original}\n")
    else:
        print("No duplicate PDF files found.")

def copy_pdfs(root=None, src_folder='C:/Users/nares/Zotero/storage', dest_folder='C:/Users/nares/Videos/Captures'):
    if not os.path.exists(dest_folder):
        os.makedirs(dest_folder)

    for rooti, dirs, files in os.walk(src_folder):
        for file in files:
            if file.lower().endswith('.pdf'):
                src_file_path = os.path.join(rooti, file)
                dest_file_path = os.path.join(dest_folder, file)
                shutil.copy2(src_file_path, dest_file_path)
                print(f"Copied {src_file_path} to {dest_file_path}")

def plot_csv(root, file_path="C:/Users/nares/Downloads/240301/240301/240301_195952.csv", x_column="sn", y_column="bd"):
    # Read the CSV file into a DataFrame
    open_file_dialog("plot_csv")

    csv_file = find_json_value(INPUT_VALUES, "plot_csv")
    df = pd.read_csv(csv_file)
    df[x_column] = (df[x_column].astype(float)) / 10
    df[y_column] = (df[y_column].astype(float)) * 400
    # Check if the specified columns exist in the DataFrame
    if x_column not in df.columns or y_column not in df.columns:
        raise ValueError(f"Columns '{x_column}' or '{y_column}' not found in the CSV file.")

        # Skip the first 20 frames
    df = df.iloc[64:-40]
        # Plot the data
    plt.figure(figsize=(10, 6))

    plt.plot(df[x_column], df[y_column], )  # marker='o')
        # hori = 35.0
        # plt.axhline(y=hori, color='r', linestyle='--', label=hori)  # Add this line to plot the horizontal line at y=0.5
        # plt.axhline(y=hori/2.5, color='g', linestyle='--', label=hori/2.5)  # Add this line to plot the horizontal line at y=0.5
        # Add labels and title
    plt.xlabel("Time (s)")
    plt.ylabel("Brightness intensity")
    plt.title('')
        # plt.legend()
        # Show grid
    plt.grid(False)

        # Show the plot
    plt.show()



    
def labeling(root= None):
    # Create a directed graph
    G = nx.DiGraph()

    # Add nodes and edges based on the hierarchy
    hierarchy = {
        "Additive Manufacturing Micro 3D Printing Deposition Techniques": [
            ("Photopolymerization-based Methods", [
                "Two-Photon Polymerization (2PP)", 
                "Stereolithography (SLA)", 
                "Digital Light Processing (DLP)", 
                "Continuous Liquid Interface Production (CLIP)"
            ]),
            ("Material Extrusion", [
                "Fused Deposition Modeling (FDM) for micro-scale", 
                "Direct Ink Writing (DIW)", 
                "Robocasting"
            ]),
            ("Powder Bed Fusion", [
                "Selective Laser Sintering (SLS) for micro-parts", 
                "Micro Laser Sintering (MLS)", 
                "Electron Beam Melting (EBM) adapted for micro-scale"
            ]),
            ("Direct Energy Deposition", [
                "Laser Engineered Net Shaping (LENS) for micro-applications", 
                "Electron Beam Additive Manufacturing (EBAM) at micro-scale"
            ]),
            ("Material Jetting", [
                "Polyjet for micro-scale applications", 
                "Nanoparticle Jetting (NPJ)"
            ]),
            ("Binder Jetting", [
                "Micro-scale binder jetting for metal and ceramic parts"
            ]),
            ("Sheet Lamination", [
                "Laminated Object Manufacturing (LOM) adapted for micro-scale"
            ]),
            ("Electrochemical and Electrohydrodynamic Methods", [
                "Electrohydrodynamic Jet (E-Jet) Printing", 
                "Electrochemical Deposition"
            ]),
            ("Laser-Assisted Methods", [
                "Laser-Induced Forward Transfer (LIFT)", 
                "Laser-Assisted Electrophoretic Deposition (LAEPD)"
            ]),
            ("Hybrid and Emerging Techniques", [
                "Lithography-based Metal Manufacturing (LMM)", 
                "Volumetric Additive Manufacturing", 
                "4D Printing at Micro-scale"
            ])
        ]
    }

    # Add edges to the graph
    for main, subcategories in hierarchy.items():
        for category, techniques in subcategories:
            G.add_edge(main, category)
            for technique in techniques:
                G.add_edge(category, technique)

    # Draw the graph with a top-to-bottom layout
    plt.figure(figsize=(10, 14))
    pos = nx.nx_agraph.graphviz_layout(G, prog='dot')  # Use 'dot' for top-to-bottom hierarchy
    nx.draw(G, pos, with_labels=True, arrows=False, node_size=3000, node_color="lightblue", 
            font_size=10, font_weight="bold", edge_color="gray")
    plt.title("Hierarchy of Additive Manufacturing Micro 3D Printing Deposition Techniques")
    plt.show()


def plot_csvy(root, x_column="sn", y_column="bd"):
    # Function to be called when OK button is pressed
    if open_file_dialog_t("plot_csv"):
        csv_file = find_json_value(INPUT_VALUES, "plot_csv")
        dfo = pd.read_csv(csv_file)
        print(list(dfo.columns))

        def on_ok():
            # Retrieve input value from the entry
            input_value = entry.get()
            print("User input:", input_value)  # For debugging or further use

            # Destroy the popup window after the input is taken
            popup.destroy()

            # Proceed with the plotting process
            plot_data()

        def plot_data():
            df = pd.read_csv(csv_file)
            df[x_column] = (df[x_column].astype(float)) / 10
            df[y_column] = (df[y_column].astype(float)) * 400

            # Check if the specified columns exist in the DataFrame
            if x_column not in df.columns or y_column not in df.columns:
                raise ValueError(f"Columns '{x_column}' or '{y_column}' not found in the CSV file.")

            # Skip the first 20 frames
            df = df.iloc[64:-40]

            # Plot the data
            plt.figure(figsize=(10, 6))
            plt.plot(df[x_column], df[y_column])

            # Add labels and title
            plt.xlabel("Time (s)")
            plt.ylabel("Brightness intensity")
            plt.title('')

            # Show grid
            plt.grid(False)

            # Show the plot
            plt.show()

        # Create a popup window
        popup = ctk.CTkToplevel(root)
        popup.geometry("300x150")
        popup.title("Input Required")
        popup.attributes("-topmost", True)
        # Label and Entry for input
        headers = ["X-axis", "Y-axis"]
        items = [list(dfo.columns), list(dfo.columns)]

        # Create the listview
        create_listview(popup, headers, items)

        label = ctk.CTkLabel(popup, text="Description:")
        label.pack(pady=10)
        entry = ctk.CTkEntry(popup)
        entry.pack(pady=10)

        # OK button to save input and close popup
        ok_button = ctk.CTkButton(popup, text="OK", command=on_ok)
        ok_button.pack(pady=20)

