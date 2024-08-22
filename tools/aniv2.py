import numpy as np
import matplotlib.pyplot as plt
import matplotlib.animation as animation
from matplotlib.offsetbox import OffsetImage, AnnotationBbox
from PIL import Image, ImageDraw
import moviepy.editor as mpy
import os


# Function to make an image round
def make_round(image):
    # Create a mask for the circular area
    mask = Image.new('L', image.size, 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse((0, 0, image.size[0], image.size[1]), fill=255)

    # Apply the mask to the image
    image.putalpha(mask)
    return image


# Load images for each category
icon_paths = ['img.png', 'img.png', 'img.png', 'img.png', 'img.png']
icons = [Image.open(icon_path).resize((50, 50)) for icon_path in icon_paths]
icons = [make_round(icon) for icon in icons]  # Apply round mask


# Function to generate random colors
def generate_colors(num_colors):
    np.random.seed(0)  # For reproducibility
    return np.random.rand(num_colors, 3)  # Generate random RGB colors


# Initial categories and random values
categories = ['A', 'B', 'C', 'D', 'E']
values = np.random.rand(len(categories)) * 100
colors = generate_colors(len(categories))  # Generate colors for each category

# Create a figure and axis
fig, ax = plt.subplots()

# Set the limits
ax.set_xlim(0, 120)


# Function to add an image at a specific position
def add_image(ax, img, x, y):
    imagebox = OffsetImage(img, zoom=0.5, resample=Image.BOX)
    ab = AnnotationBbox(imagebox, (x, y), frameon=False, xycoords='data', boxcoords="offset points", pad=0.5)
    ax.add_artist(ab)


# Update function for animation
def update(frame):
    ax.clear()  # Clear the axis to update the positions
    new_values = np.random.rand(len(categories)) * 100  # Generate new random values

    # Sort the categories by the new values
    sorted_indices = np.argsort(new_values)[::-1]
    sorted_values = new_values[sorted_indices]
    sorted_colors = colors[sorted_indices]  # Sort colors to match sorted values

    # Update bars with sorted values
    bars = ax.barh(np.arange(len(sorted_values)), sorted_values, color=sorted_colors)
    ax.set_xlim(0, 120)

    # Add icons for each bar at the corresponding position
    for i, icon_index in enumerate(sorted_indices):
        bar_width = sorted_values[i]
        # Adjust the position of the icon to be in line with the bar
        add_image(ax, icons[icon_index], x=bar_width - 20, y=i)

    # Remove y-axis labels (since we're using icons)
    ax.set_yticks([])
    ax.set_yticklabels([])

    return bars


# Create an animation object
ani = animation.FuncAnimation(fig, update, frames=50, interval=500, blit=False)

# Save the animation as a series of frames
frame_files = []
for i in range(50):
    update(i)
    frame_file = f"frame_{i:03d}.png"
    plt.savefig(frame_file)
    frame_files.append(frame_file)

# Create a video from the frames using moviepy
clip = mpy.ImageSequenceClip(frame_files, fps=10)
clip.write_videofile("animated_bar_chart.mp4", codec="libx264")

# Clean up frame files
for frame_file in frame_files:
    os.remove(frame_file)

# To display the animation in a window, uncomment the line below
plt.show()
