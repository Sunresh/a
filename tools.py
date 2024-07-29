import csv
import os
import subprocess
import sys
import json

import numpy as np


import logging

# Configure the logging settings
logging.basicConfig(
    encoding='utf-8',          # Log encoding
    filename='file.log',       # Log file name
    level=logging.DEBUG,       # Log level
    format='%(asctime)s - %(filename)s - %(lineno)d - %(levelname)s - %(message)s'  # Log message format
)

# Create a logger object
logger = logging.getLogger(__name__)


def isFileExists(file):
    if not os.path.exists(file):
        # Print a message indicating the file doesn't exist and create the required directory
        print(f"{file} not found, checking directory...")

        # Extract the directory from the file path
        directory = os.path.dirname(file)

        # Check if the directory exists, if not, create it
        if not os.path.exists(directory):
            if not directory =='':
                print(f"Creating directory: {directory}")
                os.makedirs(directory)

def install_package(package_name):
    try:
        __import__(package_name)
        print(f"The package '{package_name}' is already installed.")
    except ImportError:
        print(f"The package '{package_name}' is not installed. Installing now...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", package_name])
        print(f"The package '{package_name}' has been installed successfully.")


def read_json(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        return data
    except FileNotFoundError:
        # If the file doesn't exist, create it and return an empty dictionary
        save_as_json([],file_path)
        return []

def save_as_json(data, file_path):
    isFileExists(file_path)
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=4, ensure_ascii=False)
    logger.info(f"{data} is saved in {file_path} as JSON successfully.")


def find_json_value(read_file, key):
    isFileExists(read_file)
    json_data = read_json(read_file)
    if isinstance(json_data, dict):
        logger.info(f"find_json_value: {key} into {read_file} is {json_data.get(key)}")
        return json_data.get(key)

    logger.error("Error: JSON data is not a dictionary.")
    return None

def update_json(write_file,json_key, json_value):
    isFileExists(write_file)
    # Read the current settings
    settings = read_json(write_file)
    # Ensure the settings is a dictionary
    if not isinstance(settings, dict):
        settings = {}

    # Update or add the key-value pair ensuring type consistency
    if isinstance(json_value, float):
        settings[json_key] = json_value
    elif isinstance(json_value, str):
        try:
            # Attempt to convert the string to an integer to ensure type consistency
            int_value = float(json_value)
            settings[json_key] = int_value
        except ValueError:
            # If conversion fails, store the original string
            settings[json_key] = json_value

    # Save the updated settings back to the file
    save_as_json(settings, write_file)
    logger.info(f"Key={json_key},And Value={json_value} is updated into {write_file}")



def map_get_value(key, input_values_path, input_btn_list_path):
    pref_data = read_json(input_values_path)
    input_j_data = read_json(input_btn_list_path)
    
    try:
        angle_ = int(find_json_value(pref_data, input_j_data[key]))
    except (ValueError, TypeError) as e:
        logger.error(f"Error: {e}. Could not convert value to int.")
        angle_ = None  # or set to a default value like 0 or -1

    return angle_


def save_to_csv(data, filename):
    isFileExists(filename)
    try:
        with open(filename, 'w', newline='') as csvfile:
            writer = csv.writer(csvfile)
            writer.writerow(['x', 'y', 'z'])  # Header row
            writer.writerows(data)
    except Exception as e:
        logger.error(f"Error: {e}")

def read_csv_data(filename):
    isFileExists(filename)
    with open(filename, 'r') as csvfile:
        reader = csv.reader(csvfile)
        header = next(reader, None)  # Skip the header row
        data = [row for row in reader]
        
    if not data:
        raise ValueError("No data found in the CSV file.")
    
    if len(data[0]) != 3:
        raise ValueError("Data rows do not contain exactly three columns.")
    
    x_data, y_data, z_data = zip(*data)
    return np.asarray(x_data, dtype=float), np.asarray(y_data, dtype=float), np.asarray(z_data, dtype=float)


def get_csv_max(csv_file_path):
# Initialize variables to store maximum values
    max_X = float('-inf')
    max_Y = float('-inf')
    max_Z = float('-inf')
    # Read the CSV file and compute the maximum values
    with open(csv_file_path, mode='r', newline='', encoding='utf-8') as csvfile:
        csvreader = csv.reader(csvfile)
        header = next(csvreader)  # Skip header
        for row in csvreader:
            x_value = float(row[0])
            y_value = float(row[1])
            z_value = float(row[2])
            
            if x_value > max_X:
                max_X = x_value
            if y_value > max_Y:
                max_Y = y_value
            if z_value > max_Z:
                max_Z = z_value

    return max_X,max_Y,max_Z

def c_round(number):
    rounded = round(number)
    if 0<(number - rounded) <= 0.5:
        return rounded + 1
    else:
        return rounded