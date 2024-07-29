import pandas as pd
from all_graph import one_graph_all_param
from constants import INPUT_VALUES
from tools import find_json_value

class Twocsv:
    def __init__(self):
        self.csv1 = find_json_value(INPUT_VALUES, "file1")
        self.csv2 = find_json_value(INPUT_VALUES, "file2")
        self.output_file = 'merged.csv'
        self.column = 'BD'
        
    def read_and_merge(self):
        # Read the CSV files
        df1 = pd.read_csv(self.csv1)
        df2 = pd.read_csv(self.csv2)
        # Extract the 'bd' columns
        bd1 = df1[self.column]
        bd2 = df2[self.column]
        # Create a new DataFrame with the required format
        merged_df = pd.DataFrame({
            'sn': range(1, len(bd1) + 1),
            'bd1': bd1,
            'bd2': bd2
        })
        # Save the new DataFrame to a new CSV file
        merged_df.to_csv(self.output_file, index=False)
        
# Usage
twocsv = Twocsv()
twocsv.read_and_merge()
one_graph_all_param(file="merged.csv")
