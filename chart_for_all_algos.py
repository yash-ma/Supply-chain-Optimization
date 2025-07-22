import pandas as pd
import plotly.graph_objects as go
from plotly.subplots import make_subplots

# Load the data
df = pd.read_csv("algorithm_comparison.csv")

# Brand colors for each algorithm
colors = ['#1FB8CD', '#DB4545', '#2E8B57', '#5D878F', '#D2BA4C']

# Abbreviate algorithm names to fit 15 char limit
algorithm_abbrev = [
    'Dijkstra',
    'Genetic Alg',
    'Ant Colony', 
    'Reinforcement',
    'ML Hybrid'
]

# Create subplots with secondary y-axis for different scales
fig = make_subplots(specs=[[{"secondary_y": True}]])

# Add bars for each algorithm - Route Length on primary y-axis
for i, (alg, color) in enumerate(zip(algorithm_abbrev, colors)):
    fig.add_trace(
        go.Bar(
            name=alg,
            x=[f"{alg}_RL"],
            y=[df.iloc[i]['Average_Route_Length_km']],
            marker_color=color,
            legendgroup=alg,
            cliponaxis=False,
            width=0.35
        ),
        secondary_y=False,
    )

# Add bars for each algorithm - Cost Savings on secondary y-axis  
for i, (alg, color) in enumerate(zip(algorithm_abbrev, colors)):
    fig.add_trace(
        go.Bar(
            name=alg,
            x=[f"{alg}_CS"],
            y=[df.iloc[i]['Cost_Savings_Percentage']],
            marker_color=color,
            legendgroup=alg,
            showlegend=False,
            cliponaxis=False,
            width=0.35
        ),
        secondary_y=True,
    )

# Add computation time annotations
for i, (alg, time) in enumerate(zip(algorithm_abbrev, df['Computation_Time_seconds'])):
    # Position annotation between the two bars for each algorithm
    x_pos = i * 2 + 0.5
    fig.add_annotation(
        x=x_pos,
        y=280,
        text=f"{time}s",
        showarrow=False,
        font=dict(size=11),
        xref="x",
        yref="y"
    )

# Update x-axis to show proper labels
x_labels = []
x_positions = []
for i, alg in enumerate(algorithm_abbrev):
    x_labels.extend([f"{alg}_RL", f"{alg}_CS"])
    x_positions.extend([i*2, i*2+1])

# Create custom x-axis labels
fig.update_layout(
    title="Route Optimization Algorithm Performance Comparison",
    barmode='group',
    legend=dict(orientation='h', yanchor='bottom', y=1.05, xanchor='center', x=0.5),
    xaxis=dict(
        tickmode='array',
        tickvals=list(range(len(x_labels))),
        ticktext=[label.replace('_RL', '\nRoute Length').replace('_CS', '\nCost Savings') for label in x_labels],
        title="Algorithms"
    )
)

# Update y-axes
fig.update_yaxes(title_text="Route Length (km)", secondary_y=False)
fig.update_yaxes(title_text="Cost Savings (%)", secondary_y=True)

# Save the chart
fig.write_image("algorithm_performance_comparison.png")
print("Chart saved successfully!")
