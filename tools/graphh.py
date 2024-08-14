import pandas as pd
import plotly.express as px

# Load the data from the CSV file
df = pd.read_csv('population.csv')

# Create the animated bar chart
fig = px.bar(
    df,
    x="Country",
    y="Population",
    animation_frame="Year",
    range_y=[0, max(df['Population']) * 1.2],
    title="Population Over Time",
    color="Population",
    color_continuous_scale='Viridis',  # Using a color scale for better visual appeal
    text="Population"  # Display population numbers on bars
)

# Update layout for better styling
fig.update_layout(
    title={
        'text': "Population Over Time",
        'x': 0.5,
        'xanchor': 'center',
        'y': 0.95,
        'yanchor': 'top',
        'font': {'size': 24, 'color': 'rgb(33, 37, 41)'}
    },
    xaxis_title="Country",
    yaxis_title="Population",
    xaxis=dict(
        categoryorder='total descending',  # Sort bars by population in each frame
        title_font=dict(size=18, family='Arial, sans-serif'),
        tickfont=dict(size=14, family='Arial, sans-serif')
    ),
    yaxis=dict(
        title_font=dict(size=18, family='Arial, sans-serif'),
        tickfont=dict(size=14, family='Arial, sans-serif')
    ),
    coloraxis_colorbar=dict(
        title="Population",
        tickvals=[0, max(df['Population'])],
        ticktext=['Low', 'High']
    ),
    updatemenus=[
        {
            'buttons': [
                {
                    'args': [None, {'frame': {'duration': 1000, 'redraw': True}, 'fromcurrent': True}],
                    'label': 'Play',
                    'method': 'animate',
                },
                {
                    'args': [[None], {'frame': {'duration': 0, 'redraw': True}, 'mode': 'immediate', 'transition': {'duration': 0}}],
                    'label': 'Pause',
                    'method': 'animate',
                }
            ],
            'direction': 'left',
            'pad': {'r': 10, 't': 87},
            'showactive': False,
            'type': 'buttons',
            'x': 0.1,
            'xanchor': 'right',
            'y': 0,
            'yanchor': 'top'
        }
    ],
    sliders=[{
        'steps': [
            {
                'args': [
                    [f'{year}'],
                    {'frame': {'duration': 300, 'redraw': True}, 'mode': 'immediate', 'transition': {'duration': 300}},
                ],
                'label': f'{year}',
                'method': 'animate'
            } for year in df['Year'].unique()
        ],
        'currentvalue': {
            'prefix': 'Year: ',
            'visible': True,
            'xanchor': 'right'
        },
        'pad': {'b': 10},
        'len': 0.9,
        'x': 0.1,
        'y': 0,
    }]
)

fig.update_traces(texttemplate='%{text:.0f}', textposition='outside', marker=dict(line=dict(color='rgb(0,0,0)', width=1.5)))

fig.show()
