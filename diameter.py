import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

# Data for CSV and plotting
data = {
    "Velocity (µm/s)": [0.15, 0.21, 0.328, 0.54, 0.765, 0.929, 1.29, 2.0, 2.6, 3.0],
    "Average Diameter (µm)": [2.8, 2.7, 2.5, 2.0, 1.1, 1.0, 0.7, 0.6, 0.5, 0.5],
    "Error minus (µm)": [0.1, 0.1, 0.1, 0.2, 0.1, 0.3, 0.1, 0.2, 0.2, 0.1],
    "Error plus (µm)": [0.2, 0.1, 0.1, 0.2, 0.1, 0.2, 0.1, 0.2, 0.1, 0.2],
}

# Save to CSV
df = pd.DataFrame(data)
df.to_csv('velocity_Diameter_data.csv', index=False)
print("CSV file generated: velocity_Diameter_data.csv")

# Plotting
velocity = np.array(data['Velocity (µm/s)'])
Diameter = np.array(data['Average Diameter (µm)'])
error_minus = np.array(data['Error minus (µm)'])
error_plus = np.array(data['Error plus (µm)'])

# Create error bars
error = [error_minus, error_plus]

# Plot
plt.errorbar(velocity, Diameter, yerr=error, fmt='o', label='Diameter (with error bars)', capsize=5)
plt.axhline(y=3.5, color='r', linestyle='--', label='Target Diameter = 30 µm')

# Add labels and title
plt.xlabel('Velocity (µm/s)')
plt.ylabel('Diameter (µm)')
plt.title('Diameter of pillars as a function of stage velocity')
plt.legend()
plt.grid(False)

# Display plot
plt.show()
