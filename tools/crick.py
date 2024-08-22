import json

class PlayerData:
    def __init__(self):
        self.players = {}

    def add_player(self, name, scores):
        self.players[name] = {'scores': scores}

    def get_player_names(self):
        return list(self.players.keys())

    def get_scores(self, name):
        return self.players.get(name, {}).get('scores', [])

class HTMLGenerator:
    def __init__(self, title="Cricket Run Scores", output_file="output.html"):
        self.title = title
        self.output_file = output_file
        self.body_content = ""

    def add_plot(self, plot_id="myPlot", width="100%", height="100%"):
        self.plot_id = plot_id
        plot_div = f'<div id="{plot_id}" style="width:{width}; height:{height};"></div>'
        self.body_content += plot_div

    def generate_script(self, player_data, years):
        player_names = player_data.get_player_names()
        player_scores = {name: player_data.get_scores(name) for name in player_names}

        script_content = f"""
        <script>
            const playerScores = {json.dumps(player_scores)};
            const players = {json.dumps(player_names)};
            const years = {json.dumps(years)};

            let data = players.map(player => {{
                return {{
                    y: [player],
                    x: [playerScores[player][0]],
                    name: player,
                    type: 'bar',
                    orientation: 'h'
                }};
            }});

            let frames = years.map((year, index) => {{
                let frameData = players.map(player => {{
                    return {{
                        y: [player],
                        x: [playerScores[player][index]],
                        type: 'bar',
                        orientation: 'h',
                        name: player,
                        text: player,
                        textposition: 'inside',
                        insidetextanchor: 'middle',
                        textfont: {{color: 'white'}}
                    }};
                }});
                frameData.sort((a, b) => b.x[0] - a.x[0]);
                return {{
                    name: year,
                    data: frameData
                }};
            }});

            let layout = {{
                title: '{self.title}',
                xaxis: {{range: [0, 16000], title: 'Cumulative Run Score'}},
                yaxis: {{title: '', showticklabels: false, autorange: true, categoryorder: 'total ascending'}},
                barmode: 'group',
                height: 600,
                updatemenus: [{{
                    x: 500,
                    y: 12,
                    yanchor: 'bottom',
                    xanchor: 'right',
                    showactive: false,
                    direction: 'left',
                    type: 'buttons',
                    pad: {{t: 87, r: 10}},
                    buttons: [{{
                        method: 'animate',
                        args: [null, {{
                            fromcurrent: true,
                            transition: {{duration: 1900}},
                            frame: {{duration: 1500, redraw: true}}
                        }}],
                        label: ''
                    }}, {{
                        method: 'animate',
                        args: [[null], {{
                            mode: 'immediate',
                            transition: {{duration: 0}},
                            frame: {{duration: 0, redraw: true}}
                        }}],
                        label: ''
                    }}]
                }}],
                sliders: [{{
                    steps: years.map(year => {{
                        return {{
                            method: 'animate',
                            label: year,
                            args: [[year], {{
                                mode: 'immediate',
                                transition: {{duration: 1900}},
                                frame: {{duration: 1300, redraw: true}}
                            }}]
                        }};
                    }}),
                    x: 0,
                    y: 0,
                    currentvalue: {{
                        visible: true,
                        prefix: 'Year:',
                        xanchor: 'right',
                        font: {{size: 20, color: '#666'}}
                    }},
                    transition: {{duration: 300, easing: 'cubic-in-out'}},
                }}]
            }};

            Plotly.newPlot('{self.plot_id}', frames[0].data, layout).then(function() {{
                Plotly.addFrames('{self.plot_id}', frames);
            }});
        </script>
        """
        self.body_content += script_content

    def build_html(self):
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>{self.title}</title>
            <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
            <style>
                body {{
                    margin: 40;
                    padding: 40;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    background-color: #f4f4f4;
                }}
            </style>
        </head>
        <body>
            {self.body_content}
        </body>
        </html>
        """
        return html_content

    def save_html(self):
        html_content = self.build_html()
        with open(self.output_file, 'w') as file:
            file.write(html_content)
        print(f"HTML file saved as {self.output_file}")


# Example usage
player_data = PlayerData()
player_data.add_player('Tendulkar', [0, 0, 0, 0, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000, 11000, 12000, 13000, 14000, 15000, 15921, 15921, 15921, 15921, 15921])
player_data.add_player('Ponting', [0, 500, 1500, 2500, 3500, 4500, 5500, 6500, 7500, 8500, 9500, 10500, 11500, 12000, 13000, 13378, 13378, 13378, 13378, 13378, 13378, 13378, 13378, 13378])
player_data.add_player('ioi', [0, 0, 0, 0, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000, 11000, 12000, 13000, 14000, 15000, 15921, 15921, 15921, 15921, 15921])
player_data.add_player('hh', [0, 500, 1500, 2500, 3500, 4500, 5500, 6500, 7500, 8500, 9500, 10500, 11500, 12000, 13000, 13378, 13378, 13378, 13378, 13378, 13378, 13378, 13378, 13378])
player_data.add_player('hgf', [0, 0, 0, 0, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000, 11000, 12000, 13000, 14000, 15000, 15921, 15921, 15921, 15921, 15921])
player_data.add_player('ds', [0, 500, 1500, 2500, 3500, 4500, 5500, 6500, 7500, 8500, 9500, 10500, 11500, 12000, 13000, 13378, 13378, 13378, 13378, 13378, 13378, 13378, 13378, 13378])
player_data.add_player('Teniiidulkar', [0, 0, 0, 0, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000, 11000, 12000, 13000, 14000, 15000, 15921, 15921, 15921, 15921, 15921])
player_data.add_player('Pontpping', [0, 500, 1500, 2500, 3500, 4500, 5500, 6500, 7500, 8500, 9500, 10500, 11500, 12000, 13000, 13378, 13378, 13378, 13378, 13378, 13378, 13378, 13378, 13378])
player_data.add_player('iouyt', [0, 0, 0, 0, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000, 11000, 12000, 13000, 14000, 15000, 15921, 15921, 15921, 15921, 15921])
player_data.add_player('ouy', [0, 500, 1500, 2500, 3500, 4500, 5500, 6500, 7500, 8500, 9500, 10500, 11500, 12000, 13000, 13378, 13378, 13378, 13378, 13378, 13378, 13378, 13378, 13378])
player_data.add_player('gh', [0, 0, 0, 0, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000, 11000, 12000, 13000, 14000, 15000, 15921, 15921, 15921, 15921, 15921])
player_data.add_player('qwe', [0, 500, 1500, 2500, 3500, 4500, 5500, 6500, 7500, 8500, 9500, 10500, 11500, 12000, 13000, 13378, 13378, 13378, 13378, 13378, 13378, 13378, 13378, 13378])
player_data.add_player('dfgh', [0, 0, 0, 0, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000, 11000, 12000, 13000, 14000, 15000, 15921, 15921, 15921, 15921, 15921])
player_data.add_player('dfgh', [0, 500, 1500, 2500, 3500, 4500, 5500, 6500, 7500, 8500, 9500, 10500, 11500, 12000, 13000, 13378, 13378, 13378, 13378, 13378, 13378, 13378, 13378, 13378])
player_data.add_player('dfgh', [0, 0, 0, 0, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000, 11000, 12000, 13000, 14000, 15000, 15921, 15921, 15921, 15921, 15921])
player_data.add_player('fgh', [0, 500, 1500, 2500, 3500, 4500, 5500, 6500, 7500, 8500, 9500, 10500, 11500, 12000, 13000, 13378, 13378, 13378, 13378, 13378, 13378, 13378, 13378, 13378])
player_data.add_player('yujk', [0, 0, 0, 0, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000, 11000, 12000, 13000, 14000, 15000, 15921, 15921, 15921, 15921, 15921])
player_data.add_player('dfgh', [0, 500, 1500, 2500, 3500, 4500, 5500, 6500, 7500, 8500, 9500, 10500, 11500, 12000, 13000, 13378, 13378, 13378, 13378, 13378, 13378, 13378, 13378, 13378])
player_data.add_player('cvbn', [0, 0, 0, 0, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000, 11000, 12000, 13000, 14000, 15000, 15921, 15921, 15921, 15921, 15921])
player_data.add_player('poi', [0, 500, 1500, 2500, 3500, 4500, 5500, 6500, 7500, 8500, 9500, 10500, 11500, 12000, 13000, 13378, 13378, 13378, 13378, 13378, 13378, 13378, 13378, 13378])

# Define the range of years
years = list(range(2000, 2024))

# Generate and save the HTML
html_gen = HTMLGenerator(output_file="hiop.html")
html_gen.add_plot()
html_gen.generate_script(player_data, years)
html_gen.save_html()
