import pandas as pd
import plotly.express as px

# Load the data from the CSV file
df = pd.read_csv('population.csv')

# Function to keep only the top three countries across all years
def filter_top_three_overall(df):
    # Summing population across all years for each country
    df_total = df.groupby('Country').agg({'Population': 'sum'}).reset_index()
    # Get the top three countries
    top_three_countries = df_total.nlargest(3, 'Population')
    # Filter the original dataframe for these top three countries
    return df[df['Country'].isin(top_three_countries['Country'])]

# Apply the filter function
df_top3 = filter_top_three_overall(df)

# Create the bar chart for the top 3 countries overall
fig = px.bar(
    df_top3,
    x="Population",
    y="Country",
    color="Country",
    orientation='h',
    title="Top 3 Populations Across All Years",
    text="Population"
)

# Update layout for better styling
fig.update_layout(
    title={
        'text': "Top 3 Populations Across All Years",
        'x': 0.5,
        'xanchor': 'center',
        'y': 0.95,
        'yanchor': 'top',
        'font': {'size': 24, 'color': 'rgb(33, 37, 41)'}
    },
    xaxis_title="Total Population",
    yaxis_title="Country",
    xaxis=dict(
        title_font=dict(size=18, family='Arial, sans-serif'),
        tickfont=dict(size=14, family='Arial, sans-serif')
    ),
    yaxis=dict(
        title_font=dict(size=18, family='Arial, sans-serif'),
        tickfont=dict(size=14, family='Arial, sans-serif')
    ),
    showlegend=False  # Hide legend since there are only 3 countries
)

# Ensure that bars with higher values are on top
fig.update_yaxes(categoryorder='total ascending')

# Show the figure
fig.show()
