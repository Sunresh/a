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
    
    def __del__(self):
        self.plot_csv_file(SPIRAL_CSV_FILE)
        
    def print(self):
        print(f"Angle: {self.angle}")
        print(f"Resolution: {self.resolution}")
        print(f"Base Height: {self.base_height}")
        print(f"Total Height: {self.total_height}")
        
    def axis_rotate(self, axis):
        try:
            if axis not in ['x', 'y', 'xy']:
                raise ValueError("Invalid axis. Expected 'x', 'y', or 'xy'.")

            x_data = []
            y_data = []
            z_data = []
            index = 0
            z_axix = 0

            while index < self.total_steps:
                radius, z_axix = self.radius_calc(index)
                if axis == 'x':
                    x = format(radius + RADIUS_OF_COIL, '.4f')
                    y = format(RADIUS_OF_COIL, '.4f')
                elif axis == 'y':
                    x = format(RADIUS_OF_COIL, '.7f')
                    y = format(radius + RADIUS_OF_COIL, '.7f')
                elif axis == 'xy':
                    x = format(radius + RADIUS_OF_COIL, '.4f')
                    y = format(radius + RADIUS_OF_COIL, '.4f')
                
                z = format(z_axix, '.4f')
                x_data.append(x)
                y_data.append(y)
                z_data.append(z)
                index += 1

            return save_to_csv(list(zip(x_data, y_data, z_data)), SPIRAL_CSV_FILE)
        
        except Exception as e:
            logging.error(str(e))
    
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

        return save_to_csv(list(zip(x_data, y_data, z_data)), SPIRAL_CSV_FILE)
    
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
    
    
    def plot_csv_file(self,filename):
        try:
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
            ax.set_title(f"3D Printing Simulation of {self.angle} degrees")
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

