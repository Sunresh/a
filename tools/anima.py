import numpy as np
import matplotlib.pyplot as plt
import matplotlib.animation as animation

# Generate data for a sine wave
x = np.linspace(0, 2 * np.pi, 1000)
y = np.sin(x)

# Create a figure and axis
fig, ax = plt.subplots()
line, = ax.plot(x, y)

# Set the limits
ax.set_xlim(0, 2 * np.pi)
ax.set_ylim(-1.5, 1.5)

# Animation function
def update(frame):
    line.set_ydata(np.sin(x + frame / 10))  # Update the data
    return line,

# Create an animation object
ani = animation.FuncAnimation(fig, update, frames=100, interval=20, blit=True)

# Display the animation
plt.show()
