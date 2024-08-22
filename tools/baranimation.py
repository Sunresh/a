import numpy as np
import matplotlib.pyplot as plt
import matplotlib.animation as animation

# Sample data
categories = ['A', 'B', 'C', 'D', 'E']
values = np.random.rand(5) * 100

# Create a figure and axis
fig, ax = plt.subplots()

# Initial bar plot
bars = ax.bar(categories, values)

# Set the limits
ax.set_ylim(0, 120)

# Update function for animation
def update(frame):
    new_values = np.random.rand(5) * 100  # Generate new random values
    for bar, new_val in zip(bars, new_values):
        bar.set_height(new_val)  # Update bar heights
    return bars

# Create an animation object
ani = animation.FuncAnimation(fig, update, frames=50, interval=50, blit=True)

# Display the animation
plt.show()
