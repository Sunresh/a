import pandas as pd
import matplotlib.pyplot as plt
from tools.tools import logger

def one_graph_all_param(file):
    try:
        dataframe,x,y_columns,first_row = read_csv_data(file)
        for y_col in y_columns:
            plt.plot(x, dataframe[y_col], label=y_col)

        start_plt()

    except Exception:
        logger.error("one_graph_all_param",exc_info=True)


def non_truncate(file):
    dataframe,x,y_columns,first_row = read_csv_data(file)
    fig, axs = plt.subplots(len(y_columns), 1, figsize=(8, 6 * len(y_columns)), sharex=True, gridspec_kw={'hspace': 0})
    for i, col in enumerate(y_columns):
        axis_plot(axs[i],dataframe,col)
        if i < len(y_columns) - 1:
            axs[i].get_xaxis().set_visible(False)  # Hide x-axis for all except the last subplot

    axs[-1].set_xlabel(first_row[0], fontsize=10)  # Set x-label only for the last subplot
    # Hide top and right spines and ticks for all subplots except the bottom one
    for ax in axs[:-1]:
        ax.spines['bottom'].set_visible(False)
        ax.xaxis.set_ticks_position('none')

    start_plt(x_label=first_row[0])


def truncate_plot(file,truncate_frame=0,max_frame=1000):
    dataframe,x,y_columns,first_row = read_csv_data(file)
    max_frame=742
    dataframe = dataframe.iloc[truncate_frame:]
    dataframe[first_row[0]] = (10*dataframe[first_row[0]]-truncate_frame)
    fig, axs = plt.subplots(len(y_columns), 1, figsize=(8, 6 * len(y_columns)), sharex=True, gridspec_kw={'hspace': 0})
    for i, col in enumerate(y_columns):
        if len(dataframe[first_row[0]]) > max_frame:
            dataframe = dataframe.iloc[:max_frame]
        if col != 'PZT volt':
            axis_plot(axs[i],dataframe,col)

        if i < len(y_columns) - 1:
            axs[i].get_xaxis().set_visible(False)  # Hide x-axis for all except the last subplot

        if col == 'PZT volt':  # Check if it's the third subplot ('PZT volt')
            axs[i].plot(dataframe[first_row[0]], dataframe[col] - 1.1, label=col + ' - 0.54')
    
    axs[-1].set_xlabel(first_row[0], fontsize=10)  # Set x-label only for the last subplot

    # Hide top and right spines and ticks for all subplots except the bottom one
    for ax in axs[:-1]:
        ax.spines['bottom'].set_visible(False)
        ax.xaxis.set_ticks_position('none')
    
    start_plt(x_label=first_row[0])

def two_file_plot_data(two_files, X_COLUMN="sn", X_LABEL="B"):
    data = [None, None]
    data[0] = pd.read_csv(two_files[0])
    data[1] = pd.read_csv(two_files[1])
    # Collect all y_columns from both dataframes, excluding unnamed columns
    y_columns = set()
    for df in data:
        if df is not None:
            y_columns.update(col for col in df.columns if not col.startswith('Unnamed'))
            
    y_columns.discard(X_COLUMN)
    # Determine the number of subplots needed
    num_y_columns = len(y_columns)
    num_files = len(data)
    if num_y_columns == 0:
        logger.error("No y-columns found.")
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

                axis_plot(ax,df,col)
                if j == 0:  # Set y-axis label only for the first row
                    ax.set_ylabel(f'{col}')
                ax.legend()

    start_plt()


def start_plt(x_label="x-label is not passed.", y_label="y-label is not passed.", title="Title is not passed.",FONT_SIZE=12):
    plt.axhline(y=0.5, color='r', linestyle='--', label='y = 0.5')  # Add this line to plot the horizontal line at y=0.5
    plt.axvline(x=50, color='g', linestyle=':', label='x = 50')  # Vertical line at x=50 (customize x-value as needed)
    # Add labels and title
    plt.xlabel(x_label)
    plt.ylabel(y_label)
    plt.title(title)
    plt.legend()
    plt.xticks(fontsize=FONT_SIZE)
    plt.yticks(fontsize=FONT_SIZE)
    #plt.tight_layout()
    plt.show()

def axis_plot(ax, dataframe, col ="No y label passed",x_column="sn"):
    logger.info(f"{col} is called to plot")
    ax.plot(dataframe[x_column], dataframe[col], label=col)
    ax.set_title('')  # Clear subplot title
    ax.set_xlabel('')  # Clear x-label for all subplots
    ax.set_ylabel(col, fontsize=10)  # Set ylabel to the column name with custom font size
    ax.tick_params(axis='y', labelsize=10)
    ax.legend(fontsize=10)

def v_line_draw(ax,label,value):
    print("v_line_draw")
    if(label == "v"):
        ax.axvline(x=value, color='g', linestyle=':', label=label)
                   
    if(label == "h"):
        ax.axhline(y=value, color='g', linestyle=':', label=label) 

def read_csv_data(filename):
    try:
        dataframe = pd.read_csv(filename)
        header_array = dataframe.columns.to_numpy()
        # Extract the first column for the x-axis
        first_col = dataframe.iloc[:, 0]
        # Extract the remaining columns for the y-axis
        except_first = dataframe.columns[1:]
        # Extract the first row
        return dataframe, first_col, except_first, header_array
    except Exception:
        logger.error("read_csv_data", exc_info=True)
        return None
    
    
    