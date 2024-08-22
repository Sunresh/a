import numpy as np
import matplotlib.pyplot as plt
import matplotlib.animation as animation

# Sample data
categories = ['A', 'B', 'C', 'D', 'E']
values = np.random.rand(5) * 100

# Create a figure and axis
fig, ax = plt.subplots()

# Initial horizontal bar plot
bars = ax.barh(categories, values)

# Set the limits
ax.set_xlim(0, 120)

# Update function for animation
def update(frame):
    new_values = np.random.rand(5) * 100  # Generate new random values
    for bar, new_val in zip(bars, new_values):
        bar.set_width(new_val)  # Update bar widths
    return bars

# Create an animation object
ani = animation.FuncAnimation(fig, update, frames=50, interval=500, blit=True)

# Display the animation
plt.show()
