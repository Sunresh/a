import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

# Data for CSV and plotting
data = {
    "Velocity (µm/s)": [0.15, 0.21, 0.328, 0.54, 0.765, 0.929, 1.29, 2.0, 2.6, 3.0],
    "Average Success (%)": [80, 50, 20, 0, 0, 0, 0, 0, 0, 0],
    "Error minus (µm)": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    "Error plus (µm)": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
}

# Save to CSV
df = pd.DataFrame(data)
df.to_csv('velocity_Success_data.csv', index=False)
print("CSV file generated: velocity_Success_data.csv")

# Plotting
velocity = np.array(data['Velocity (µm/s)'])
Success = np.array(data['Average Success (%)'])
error_minus = np.array(data['Error minus (µm)'])
error_plus = np.array(data['Error plus (µm)'])

# Create error bars
error = [error_minus, error_plus]

# Plot
plt.errorbar(velocity, Success, yerr=error, fmt='o', label='Success (with error bars)', capsize=5)
plt.axhline(y=100, color='r', linestyle='--', label='Target Success = 30 µm')

# Add labels and title
plt.xlabel('Velocity (µm/s)')
plt.ylabel('Success (%)')
plt.title('Success of pillars as a function of stage velocity')
# plt.legend()
plt.grid(False)

# Display plot
plt.show()
