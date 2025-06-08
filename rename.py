import os

def rename_files_in_folder(folder_path):
    # Get a list of all files in the folder
    files = os.listdir(folder_path)
    
    # Initialize a counter for numbering the files
    counter = 1
    
    for filename in files:
        # Construct the new file name
        new_name = f"img{counter}{os.path.splitext(filename)[1]}"
        
        # Construct the full file paths
        old_file = os.path.join(folder_path, filename)
        new_file = os.path.join(folder_path, new_name)
        
        # Rename the file
        os.rename(old_file, new_file)
        
        # Increment the counter
        counter += 1

# Example usage:
rename_files_in_folder('C:/Users/nares/Desktop/GGKK')
