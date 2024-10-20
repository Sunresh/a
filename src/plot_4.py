import os
import pandas as pd
from matplotlib import pyplot as plt

class Plotting:
    def __init__(self):
        self.folder_ = r"C:\Users\naresh\OneDrive - Shizuoka University\LAB\graphs\OneDrive_9_9-21-2024\20240118"

    def list_files(self, folder):
        filesi = []
        for root, dirs, files in os.walk(folder):
            for file in files:
                if file.endswith('.csv'):
                    filesi.append(os.path.join(root, file))
        return filesi

    def double_backslashes(self, file):
        return file.replace('\\', '\\\\')

    def plotti_(self):
        file_names = self.list_files(folder=self.folder_)
        make_backslash = [self.double_backslashes(file) for file in file_names]
        
        if not make_backslash:
            print("No CSV files found in the specified folder.")
            return

        df = pd.read_csv(make_backslash[0])

        fig, ax = plt.subplots(figsize=(12, 8))

        x_column = df.columns[0]  # First column as x-axis
        first_l = df[x_column]  # First value of the first column as x-axis
        for column in df.columns[1:]:  # Skip the first column
            ax.plot(df[x_column], df[column], label=column)

        ax.set_xlabel(first_l, fontsize=10)
        ax.set_ylabel('Value', fontsize=10)
        ax.set_title('CSV Data Plot', fontsize=12)
        ax.tick_params(axis='both', which='major', labelsize=10)
        ax.legend(fontsize=10)

        plt.tight_layout()
        plt.show()

    def run(self):
        self.plotti_()

if __name__ == '__main__':
    app = Plotting()
    app.run()