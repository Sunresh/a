import numpy as np
import matplotlib.pyplot as plt
import matplotlib.animation as animation

# Initial categories and random values
categories = ['A', 'B', 'C', 'D', 'E']
values = np.random.rand(len(categories)) * 100

# Create a figure and axis
fig, ax = plt.subplots()

# Initial horizontal bar plot
bars = ax.barh(categories, values)

# Set the limits
ax.set_xlim(0, 120)


# Update function for animation
def update(frame):
    # Generate new random values
    new_values = np.random.rand(len(categories)) * 100

    # Sort the categories by the new values
    sorted_indices = np.argsort(new_values)[::-1]  # Indices of sorted values (descending order)
    sorted_categories = [categories[i] for i in sorted_indices]
    sorted_values = new_values[sorted_indices]

    # Update bars with sorted values and categories
    for bar, new_val, new_cat in zip(bars, sorted_values, sorted_categories):
        bar.set_width(new_val)
        bar.set_y(sorted_categories.index(new_cat))

    # Update y-axis labels with sorted categories
    ax.set_yticks(np.arange(len(sorted_categories)))
    ax.set_yticklabels(sorted_categories)

    return bars


# Create an animation object
ani = animation.FuncAnimation(fig, update, frames=50, interval=500, blit=True)

# Display the animation
plt.show()
