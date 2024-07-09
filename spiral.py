
import logging
import math
from matplotlib import pyplot as plt
from matplotlib.ticker import MultipleLocator
import numpy as np
from constants import INPUT_VALUES, RADIUS_OF_COIL
from tools import c_round, find_json_value, get_csv_max, read_csv_data


def plot_csv_file(filename):
    try:
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
        
    except Exception as e:
        logging.error(str(e))

def steps_segment(relosution,base_height,total_height):
    total_steps = total_height/ relosution
    base_steps = base_height / relosution
    segment2 = base_height + 1.5
    transition_steps = segment2 / relosution
    return total_steps, base_steps,transition_steps

def spiral(angle,resolution,base_height,total_height):
    x_data = []
    y_data = []
    z_data = []
    nt = 3
    index = 0
    total_steps, base_steps, transition_steps = steps_segment(resolution,base_height,total_height)
    while index < total_steps:
        if index < base_steps:
            radius = 0
        elif base_steps <= index < transition_steps:
            radius = RADIUS_OF_COIL * ((index - base_steps) / (transition_steps - base_steps))
        else:
            radius = RADIUS_OF_COIL

        x = round(radius * math.cos(nt * 2 * np.pi * index / total_steps) + RADIUS_OF_COIL, 4)
        y = round(radius * math.sin(nt * 2 * math.pi * index / total_steps) + RADIUS_OF_COIL, 4)
        z = round(index * resolution, 4)
        x_data.append(x)
        y_data.append(y)
        z_data.append(z)
        index += 1

    return list(zip(x_data, y_data, z_data))

def radius_calc(index,resolution,base_steps,total_steps,angle):
    #bendin_l = bendin_length(steps_length=resolution,base_steps=base_steps,total_steps=total_steps)
    bendin_h = bendin_z(steps_length=resolution,base_steps=base_steps,total_steps=total_steps,angle=angle)
    bendin_r = bendin_x(steps_length=resolution,base_steps=base_steps,total_steps=total_steps,angle=angle)
    base_height = base_length(steps_length=resolution,base_steps=base_steps)
    #total_h = total_steps * resolution
    if index <= base_steps:
        radius = 0
        z_axix = index * resolution
        
    if index > base_steps:
        radius = bendin_r * ( index - base_steps)/(total_steps - base_steps) * np.sin(np.radians(angle))
        z_axix = base_height + bendin_h * ( index - base_steps)/(total_steps - base_steps) * np.cos(np.radians(angle))
    
    return radius,z_axix


def x_axis_rrotat(angle,resolution,base_height,total_height):
    x_data = []
    y_data = []
    z_data = []
    index = 0
    z_axix = 0
    total_steps, base_steps, transition_steps = steps_segment(resolution,base_height,total_height)
    while index < total_steps:
        radius,z_axix = radius_calc(index,resolution,base_steps,total_steps,angle)
        x = round(radius + RADIUS_OF_COIL, 4)
        y = round(RADIUS_OF_COIL, 4)
        z = round(z_axix, 4)
        x_data.append(x)
        y_data.append(y)
        z_data.append(z)
        index += 1

    return list(zip(x_data, y_data, z_data))

def y_axis_rrotat(angle,resolution,base_height,total_height):
    x_data = []
    y_data = []
    z_data = []
    index = 0
    z_axix = 0
    total_steps, base_steps, transition_steps = steps_segment(resolution,base_height,total_height)

    while index < total_steps:
        radius,z_axix = radius_calc(index,resolution,base_steps,total_steps,angle)
        x = round(RADIUS_OF_COIL, 4)
        y = round(radius + RADIUS_OF_COIL, 4)
        z = round(z_axix, 4)
        x_data.append(x)
        y_data.append(y)
        z_data.append(z)
        index += 1

    return list(zip(x_data, y_data, z_data))

def bendin_length(steps_length,base_steps,total_steps):
    bending_steps = total_steps - base_steps
    bending_length = bending_steps * steps_length
    return bending_length

def base_length(steps_length,base_steps):
    b_length = base_steps * steps_length
    return b_length

def bendin_z(steps_length,base_steps,total_steps,angle):
    bending_height = bendin_length(steps_length=steps_length,base_steps=base_steps,total_steps=total_steps) * np.cos(np.radians(angle))
    return bending_height

def bendin_x(steps_length,base_steps,total_steps,angle):
    bending_radius = bendin_length(steps_length=steps_length,base_steps=base_steps,total_steps=total_steps) * np.sin(np.radians(angle))
    return bending_radius

def xy_rotate(angle,resolution,base_height,total_height):
    try:
        x_data = []
        y_data = []
        z_data = []
        index = 0
        z_axix = 0
        total_steps, base_steps, transition_steps = steps_segment(resolution,base_height,total_height)
        while index < total_steps:
            radius,z_axix = radius_calc(index,resolution,base_steps,total_steps,angle)
            x = round(radius + RADIUS_OF_COIL, 4)
            y = round(radius + RADIUS_OF_COIL, 4)
            z = round(z_axix, 4)
            x_data.append(x)
            y_data.append(y)
            z_data.append(z)
            index += 1

        return list(zip(x_data, y_data, z_data))
    
    except Exception as e:
        logging.error("xy rotarw")
        logging.error(str(e))

