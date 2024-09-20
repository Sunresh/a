import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

# Data for CSV and plotting
data = {
    "Velocity (µm/s)": [0.15, 0.21, 0.328, 0.54, 0.765, 0.929, 1.29, 2.0, 2.6, 3.0],
    "Average Height (µm)": [28.5, 28.0, 27.1, 26.0, 25.0, 10.7, 10.03, 4.72, 2.44, 1.5],
    "Error minus (µm)": [2.0, 2.0, 2.5, 3.0, 2.0, 1.0, 2.5, 1.2, 1.0, 0.3],
    "Error plus (µm)": [1.5, 2.0, 2.9, 3.0, 3.0, 2.0, 1.5, 0.8, 0.8, 0.8],
}

# Save to CSV
df = pd.DataFrame(data)
df.to_csv('velocity_height_data.csv', index=False)
print("CSV file generated: velocity_height_data.csv")

# Plotting
velocity = np.array(data['Velocity (µm/s)'])
height = np.array(data['Average Height (µm)'])
error_minus = np.array(data['Error minus (µm)'])
error_plus = np.array(data['Error plus (µm)'])

# Create error bars
error = [error_minus, error_plus]

# Plot
plt.errorbar(velocity, height, yerr=error, fmt='o', label='Height (with error bars)', capsize=5)
plt.axhline(y=30, color='r', linestyle='--', label='Target Height = 30 µm')

# Add labels and title
plt.xlabel('Velocity (µm/s)')
plt.ylabel('Height (µm)')
plt.title('Height of pillars as a function of stage velocity')
plt.legend()
plt.grid(False)

# Display plot
plt.show()
