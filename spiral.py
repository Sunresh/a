from matplotlib.ticker import *
import numpy as np
import csv
import math
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D
from matplotlib import pyplot as plt
from constants import *
from ui_helper import *
from tools import *

logger = setup_logger(logger=logging.getLogger(__name__))

def plot_csv_file(filename):
    angle_ = find_json_value(INPUT_VALUES,"anglr_")
    x_data, y_data, z_data = read_csv_data(filename)
    xm,ym,zm = get_csv_max(filename)
    # Create a figure and 3D axes
    fig = plt.figure()
    ax = fig.add_subplot(111, projection='3d')
    # Plot the 3D line
    ax.plot(x_data, y_data, z_data)
    # Set axis labels and title
    ax.set_xlabel("X-(V)")
    ax.set_ylabel("Y-(V)")
    ax.set_zlabel("Z-(V)")
    ax.set_title(f"3D Printing Simulation of {angle_} degrees")
    ax.xaxis.set_major_locator(MultipleLocator(1))
    ax.yaxis.set_major_locator(MultipleLocator(1))
    ax.zaxis.set_major_locator(MultipleLocator(1))
    # Set custom limits for the axes
    ax.set_xlim([0, c_round(xm)])  
    ax.set_ylim([0, c_round(ym)])  # Example y-axis range
    ax.set_zlim([0, c_round(zm)])  # Example z-axis range
    plt.show() #return fig, ax


def spiral(total_steps,base_height,total_height):
    x_data = []
    y_data = []
    z_data = []
    nt = 3
    iin = 0
    segment2 = base_height + 1.5
    base_steps = base_height * (total_steps / total_height)
    transition_steps = segment2 * (total_steps / total_height)

    while iin < total_steps:
        if iin < base_steps:
            radius = 0
        elif base_steps <= iin < transition_steps:
            radius = radius_of_coil * ((iin - base_steps) / (transition_steps - base_steps))
        else:
            radius = radius_of_coil

        x = round(radius * math.cos(nt * 2 * np.pi * iin / total_steps) + radius_of_coil, 4)
        y = round(radius * math.sin(nt * 2 * math.pi * iin / total_steps) + radius_of_coil, 4)
        z = round(iin * total_height / total_steps, 4)
        x_data.append(x)
        y_data.append(y)
        z_data.append(z)
        iin += RESOLUTION_POINTS

    return list(zip(x_data, y_data, z_data))

def radius_calc(iin,base_steps,base_height,slighted_height,total_steps,angle):
    if iin < base_steps:
        radius = 0
        z_axix = base_height * (iin / base_steps)

    else:
        radius = slighted_height * ( iin - base_steps)/(total_steps - base_steps) * np.sin(np.radians(angle))
        z_axix = base_height + slighted_height * ( iin - base_steps)/(total_steps - base_steps) * np.cos(np.radians(angle))

    return radius,z_axix


def x_axis_rrotat(angle,total_steps,base_height,total_height):
    x_data = []
    y_data = []
    z_data = []
    iin = 0
    slighted_height = total_height - base_height
    z_axix = 0
    base_steps = base_height * (total_steps / total_height)

    while iin < total_steps:
        radius,z_axix = radius_calc(iin,base_steps,base_height,slighted_height,total_steps,angle)
        x = round(radius + radius_of_coil, 4)
        y = round(radius_of_coil, 4)
        z = round(z_axix, 4)
        x_data.append(x)
        y_data.append(y)
        z_data.append(z)
        iin += RESOLUTION_POINTS

    return list(zip(x_data, y_data, z_data))

def y_axis_rrotat(angle,total_steps,base_height,total_height):
    x_data = []
    y_data = []
    z_data = []
    iin = 0
    slighted_height = total_height - base_height
    z_axix = 0
    base_steps = base_height * (total_steps / total_height)

    while iin < total_steps:
        radius,z_axix = radius_calc(iin,base_steps,base_height,slighted_height,total_steps,angle)
        x = round(radius_of_coil, 4)
        y = round(radius + radius_of_coil, 4)
        z = round(z_axix, 4)
        x_data.append(x)
        y_data.append(y)
        z_data.append(z)
        iin += RESOLUTION_POINTS

    return list(zip(x_data, y_data, z_data))


def xy_rotate(angle,total_steps,base_height,total_height):
    try:
        x_data = []
        y_data = []
        z_data = []
        iin = 0
        radius_of_coil=2.5 
        slighted_height = total_height - base_height
        z_axix = 0
        base_steps = base_height * (total_steps / total_height)

        while iin < total_steps:
            radius,z_axix = radius_calc(iin,base_steps,base_height,slighted_height,total_steps,angle)
            x = round(radius + radius_of_coil, 4)
            y = round(radius + radius_of_coil, 4)
            z = round(z_axix, 4)
            x_data.append(x)
            y_data.append(y)
            z_data.append(z)
            iin += RESOLUTION_POINTS

        return list(zip(x_data, y_data, z_data))
    
    except:
        logger.error(f"xy rotarw")

