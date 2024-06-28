import pandas as pd
import matplotlib.pyplot as plt
from constants import *
from ui_helper import *
import logging


def one_graph_all_param(file):
    try:
        dataframe = pd.read_csv(file)
        # Extract the first column for the x-axis
        x = dataframe.iloc[:, 0]
        # Extract the remaining columns for the y-axis
        y_columns = dataframe.columns[1:]
        # Plot each y column against the x column
        for y_col in y_columns:
            plt.plot(x, dataframe[y_col], label=y_col)

        # Adjust the 'sn' column if it exists
        # x = x/10
        #
        plt.axhline(y=0.5, color='r', linestyle='--', label='y = 0.5')  # Add this line to plot the horizontal line at y=0.5
        plt.axvline(x=50, color='g', linestyle=':', label='x = 50')  # Vertical line at x=50 (customize x-value as needed)
        
        # Add labels and title
        plt.xlabel(dataframe.columns[0])
        plt.ylabel('Values')
        plt.title('CSV Data Plot')
        plt.legend()
        # Show the plot
        plt.show()
        logging.info(f"one_graph_all_param={file} is successfully plotted")

        
    except Exception:
        logging.error("one_graph_all_param",exc_info=True)


def plot_datoooa(file):
    dataframe = pd.read_csv(file)
    # Extract the first column for the x-axis
    x = dataframe.iloc[:, 0]
    # Extract the remaining columns for the y-axis
    y_columns = dataframe.columns[1:]

    fig, axs = plt.subplots(len(y_columns), 1, figsize=(8, 6 * len(y_columns)), sharex=True, gridspec_kw={'hspace': 0})
    hori= 0.15
    for i, col in enumerate(y_columns):
        axs[i].plot(dataframe[x_column], dataframe[col], label=col)
        axs[i].set_title('')  # Clear subplot title
        axs[i].set_xlabel('')  # Clear x-label for all subplots
        axs[i].set_ylabel(col, fontsize=font_size)  # Set ylabel to the column name with custom font size
        axs[i].tick_params(axis='y', labelsize=font_size)
        axs[i].legend(fontsize=font_size)
        axs[1].axhline(y=hori, color='g', linestyle=':', label=hori) 

        if i < len(y_columns) - 1:
            axs[i].get_xaxis().set_visible(False)  # Hide x-axis for all except the last subplot

    verticalline1 = 12
    verticalline2 = 2
    verticalline3 = 1
    axs[-1].set_xlabel(x_label, fontsize=font_size)  # Set x-label only for the last subplot
    #axs[-1].axvline(x=verticalline1, color='g', linestyle=':', label=verticalline1) 
    #axs[-1].axvline(x=verticalline2, color='b', linestyle=':', label=verticalline2) 
    #axs[-1].axvline(x=verticalline3, color='r', linestyle=':', label=verticalline3) 


    # Hide top and right spines and ticks for all subplots except the bottom one
    for ax in axs[:-1]:
        ax.spines['bottom'].set_visible(False)
        ax.xaxis.set_ticks_position('none')

    # Set font sizes for tick labels
    plt.xticks(fontsize=font_size)
    plt.yticks(fontsize=font_size)

    plt.tight_layout()
    plt.show()


def plot_popodata(file):
    dataframe = pd.read_csv(file)
    # Extract the first column for the x-axis
    x = dataframe.iloc[:, 0]
    # Extract the remaining columns for the y-axis
    y_columns = dataframe.columns[1:]

    x_column = dataframe.columns[0]
    y_columns = dataframe.columns[1:]

    max_frame=742
    truncate_frame=92
    dataframe = dataframe.iloc[truncate_frame:]
    dataframe[x_column] = (dataframe[x_column]-truncate_frame) / 10
    fig, axs = plt.subplots(len(y_columns), 1, figsize=(8, 6 * len(y_columns)), sharex=True, gridspec_kw={'hspace': 0})

    for i, col in enumerate(y_columns):
        if len(dataframe[x_column]) > max_frame:
            dataframe = dataframe.iloc[:max_frame]
        if col != 'PZT volt':
            axs[i].plot(dataframe[x_column], dataframe[col], label=col)
            axs[i].set_title('')  # Clear subplot title
            axs[i].set_xlabel('')  # Clear x-label for all subplots
            axs[i].set_ylabel(col, fontsize=font_size)  # Set ylabel to the column name with custom font size
            axs[i].tick_params(axis='y', labelsize=font_size)

        if i < len(y_columns) - 1:
            axs[i].get_xaxis().set_visible(False)  # Hide x-axis for all except the last subplot

        if col == 'PZT volt':  # Check if it's the third subplot ('PZT volt')
            axs[i].plot(dataframe[x_column], dataframe[col] - 1.1, label=col + ' - 0.54')
    
    axs[1].axhline(y=0.020, color='r', linestyle='--', label='Upper Th = 0.020')
    axs[1].axhline(y=0.013, color='b', linestyle='--', label='Lower Th = 0.013')

    axs[-1].set_xlabel(x_label, fontsize=font_size)  # Set x-label only for the last subplot

    # Hide top and right spines and ticks for all subplots except the bottom one
    for ax in axs[:-1]:
        ax.spines['bottom'].set_visible(False)
        ax.xaxis.set_ticks_position('none')
    
    plt.xticks(fontsize=font_size)
    plt.yticks(fontsize=font_size)
    plt.tight_layout()
    plt.show()


def th_plot_data(file):
    dataframe = pd.read_csv(file)
    # Extract the first column for the x-axis
    x_column = dataframe.iloc[:, 0]
    # Extract the remaining columns for the y-axis
    y_columns = dataframe.columns[1:]
    max_frame = 742
    truncate_frame = 180
    font_size = 12
    x_label = x_column

    # Truncate the data
     # Truncate the data
    dataframe = dataframe.iloc[truncate_frame:].copy()
    dataframe[x_column] = dataframe[x_column].astype(float)  # Explicitly cast to float
    dataframe.loc[:, x_column] = (dataframe[x_column] - truncate_frame) / 10
    
    # Create subplots
    fig, axs = plt.subplots(len(y_columns), 1, figsize=(10, len(y_columns) * 2), sharex=True, gridspec_kw={'hspace': 0})

    # Plot each y_column
    for i, col in enumerate(y_columns):
        axs[i].plot(dataframe[x_column], dataframe[col], label=col)
        axs[i].set_ylabel(col, fontsize=font_size)
        axs[i].tick_params(axis='y', labelsize=font_size)
        
        # Hide x-axis for all except the last subplot
        if i < len(y_columns) - 1:
            axs[i].get_xaxis().set_visible(False)

    # Set x-label for the last subplot
    axs[-1].set_xlabel(x_label, fontsize=font_size)

    # Customize the plots
    for ax in axs[:-1]:
        ax.spines['bottom'].set_visible(False)
        ax.xaxis.set_ticks_position('none')

    # Add horizontal lines
    plt.axhline(y=0.020, color='r', linestyle='--', label='y = 0.5')
    plt.axhline(y=0.013, color='b', linestyle='--', label='y = 0.5')

    plt.xticks(fontsize=font_size)
    plt.yticks(fontsize=font_size)
    plt.tight_layout()
    plt.show()


def th_plot_datatt(data):
    x_column = data.columns[0]
    y_columns = data.columns[1:]
    max_frame=742
    truncate_frame=180
    data = data.iloc[truncate_frame:]
    data[x_column] = (data[x_column]-truncate_frame) / 10
    fig, axs = plt.subplots(len(y_columns), 1, figsize=(len(x_column),len(y_columns)), sharex=True, gridspec_kw={'hspace': 0})

    for i, col in enumerate(y_columns):
        axs[i].plot(data[x_column], data[col], label=col)
        axs[i].set_title('')  # Clear subplot title
        axs[i].set_xlabel('')  # Clear x-label for all subplots
        axs[i].set_ylabel(col, fontsize=font_size)  # Set ylabel to the column name with custom font size
        axs[i].tick_params(axis='y', labelsize=font_size)
        # axs[i].legend(fontsize=font_size)
        #axs[i].axvline(x=14.5, color='g', linestyle=':', label='x = 50') 

        if i < len(y_columns) - 1:
            axs[i].get_xaxis().set_visible(False)  # Hide x-axis for all except the last subplot

    axs[-1].set_xlabel(x_label, fontsize=font_size)  # Set x-label only for the last subplot

    # Hide top and right spines and ticks for all subplots except the bottom one
    for ax in axs[:-1]:
        ax.spines['bottom'].set_visible(False)
        ax.xaxis.set_ticks_position('none')

    
    plt.axhline(y=0.020, color='r', linestyle='--', label='y = 0.5')
    plt.axhline(y=0.013, color='b', linestyle='--', label='y = 0.5')
    
    plt.xticks(fontsize=font_size)
    plt.yticks(fontsize=font_size)
    plt.tight_layout()
    plt.show()


def two_file_plot_data(two_files, x_column="sn", x_label="B"):
    data = [None, None]
    data[0] = pd.read_csv(two_files[0])
    data[1] = pd.read_csv(two_files[1])

    # Collect all y_columns from both dataframes, excluding unnamed columns
    y_columns = set()
    for df in data:
        if df is not None:
            y_columns.update(col for col in df.columns if not col.startswith('Unnamed'))
    y_columns.discard(x_column)

    # Determine the number of subplots needed
    num_y_columns = len(y_columns)
    num_files = len(data)

    if num_y_columns == 0:
        logging.error("No y-columns found.")
        return

    if num_files == 1:
        fig, axs = plt.subplots(num_y_columns, 1, figsize=(8, 6 * num_y_columns), sharex=True, gridspec_kw={'hspace': 0})
        if num_y_columns == 1:
            axs = [axs]  # Make axs iterable
    else:
        fig, axs = plt.subplots(num_files, num_y_columns, figsize=(15, 8), sharex=True)
        if num_files == 1:
            axs = [axs]  # Make axs iterable
        elif num_y_columns == 1:
            axs = [[ax] for ax in axs]  # Make axs 2D iterable

    for j, (df, file_path) in enumerate(zip(data, two_files)):
        if df is None:
            continue

        for i, col in enumerate(y_columns):
            if col in df.columns:
                if num_files == 1:
                    ax = axs[i]
                else:
                    ax = axs[j][i]

                ax.plot(df[x_column], df[col], label=f'{col}')
                ax.set_title(col)
                ax.set_xlabel(x_label)
                if j == 0:  # Set y-axis label only for the first row
                    ax.set_ylabel(f'{col}')
                ax.legend()

    plt.tight_layout()
    plt.show()

