
import logging
import math
from matplotlib import pyplot as plt
from matplotlib.ticker import MultipleLocator
import numpy as np
from constants import INPUT_VALUES, RADIUS_OF_COIL, SPIRAL_CSV_FILE
from tools import c_round, find_json_value, get_csv_max, read_csv_data, save_to_csv


class Spiral:
    def __init__(self):
        self.angle = find_json_value(INPUT_VALUES,"anglr_")
        self.resolution = find_json_value(INPUT_VALUES,"reso")
        self.base_height = find_json_value(INPUT_VALUES,"base_h")
        self.total_height = find_json_value(INPUT_VALUES,"total_h")
        self.total_steps, self.base_steps, self.transition_steps = self.steps_segment()
    
    
    def print(self):
        print(f"Angle: {self.angle}")
        print(f"Resolution: {self.resolution}")
        print(f"Base Height: {self.base_height}")
        print(f"Total Height: {self.total_height}")
        
    def x_axis_rotat(self):
        x_data = []
        y_data = []
        z_data = []
        index = 0
        z_axix = 0
        while index < self.total_steps:
            radius,z_axix = self.radius_calc(index)
            x = format(radius + RADIUS_OF_COIL, '.4f')
            y = format(RADIUS_OF_COIL, '.4f')
            z = format(z_axix, '.4f')
            x_data.append(x)
            y_data.append(y)
            z_data.append(z)
            index += 1

        return list(zip(x_data, y_data, z_data))
    
    def radius_calc(self,index):
        #bendin_l = bendin_length(steps_length=resolution,base_steps=base_steps,total_steps=total_steps)
        bendin_h = self.bendin_z()
        bendin_r = self.bendin_x()
        base_height = self.base_length()
        #total_h = total_steps * resolution
        if index <= self.base_steps:
            radius = 0
            z_axix = index * self.resolution
            
        if index > self.base_steps:
            radius = bendin_r * ( index - self.base_steps)/(self.total_steps - self.base_steps) * np.sin(np.radians(self.angle))
            z_axix = base_height + bendin_h * ( index - self.base_steps)/(self.total_steps - self.base_steps) * np.cos(np.radians(self.angle))
        
        return radius,z_axix
    
    def bendin_z(self):
        bending_height = self.bendin_length() * np.cos(np.radians(self.angle))
        return bending_height
    
    def bendin_x(self):
        bending_radius = self.bendin_length() * np.sin(np.radians(self.angle))
        return bending_radius
    
    def base_length(self):
        b_length = self.base_steps * self.resolution
        return b_length
    
    def bendin_length(self):
        bending_steps = self.total_steps - self.base_steps
        bending_length = bending_steps * self.resolution
        return bending_length
    
    def steps_segment(self):
        total_steps = self.total_height / self.resolution
        base_steps = self.base_height / self.resolution
        segment2 = self.base_height + 1.5
        transition_steps = segment2 / self.resolution
        return total_steps, base_steps, transition_steps
    
    def spiral(self):
        x_data = []
        y_data = []
        z_data = []
        nt = 3
        index = 0
        while index < self.total_steps:
            if index < self.base_steps:
                radius = 0
            elif self.base_steps <= index < self.transition_steps:
                radius = RADIUS_OF_COIL * ((index - self.base_steps) / (self.transition_steps - self.base_steps))
            else:
                radius = RADIUS_OF_COIL

            x = format(radius * math.cos(nt * 2 * np.pi * index / self.total_steps) + RADIUS_OF_COIL, '.4f')
            y = format(radius * math.sin(nt * 2 * math.pi * index / self.total_steps) + RADIUS_OF_COIL, '.4f')
            z = format(index * self.resolution, '.4f')
            x_data.append(x)
            y_data.append(y)
            z_data.append(z)
            index += 1

        return list(zip(x_data, y_data, z_data))

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

        x = format(radius * math.cos(nt * 2 * np.pi * index / total_steps) + RADIUS_OF_COIL, '.4f')
        y = format(radius * math.sin(nt * 2 * math.pi * index / total_steps) + RADIUS_OF_COIL, '.4f')
        z = format(index * resolution, '.4f')
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
        x = format(radius + RADIUS_OF_COIL, '.7f')
        y = format(RADIUS_OF_COIL, '.7f')
        z = format(z_axix, '.7f')
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
        x = format(RADIUS_OF_COIL, '.7f')
        y = format(radius + RADIUS_OF_COIL, '.7f')
        z = format(z_axix, '.7f')
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
            x = format(radius + RADIUS_OF_COIL, '.4f')
            y = format(radius + RADIUS_OF_COIL, '.4f')
            z = format(z_axix, '.4f')
            x_data.append(x)
            y_data.append(y)
            z_data.append(z)
            index += 1

        return list(zip(x_data, y_data, z_data))
    
    except Exception as e:
        logging.error(str(e))


uu = Spiral().x_axis_rotat()
save_to_csv(uu,SPIRAL_CSV_FILE)