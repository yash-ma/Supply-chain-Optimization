import pandas as pd
import plotly.graph_objects as go

# Load the data
df = pd.read_csv("algorithm_comparison.csv")

# Shorten algorithm names to fit 15 character limit
df['Algorithm_Short'] = df['Algorithm'].map({
    'Dijkstra': 'Dijkstra',
    'Genetic Algorithm': 'Genetic',
    'Ant Colony Optimization': 'Ant Colony',
    'Reinforcement Learning': 'Reinforcement',
    'Machine Learning Hybrid': 'ML Hybrid'
})

# Create the figure
fig = go.Figure()

# Define colors (using the brand colors in order)
colors = ['#1FB8CD', '#DB4545', '#2E8B57', '#5D878F', '#D2BA4C']

# Add Route Length bars (lower is better)
fig.add_trace(go.Bar(
    x=df['Algorithm_Short'],
    y=df['Average_Route_Length_km'],
    name='Route Len (km)',
    marker_color=colors[0],
    hovertemplate='<b>%{x}</b><br>Route: %{y} km<br>Time: %{customdata} sec<extra></extra>',
    customdata=df['Computation_Time_seconds']
))

# Add Cost Savings bars (higher is better) on secondary y-axis
fig.add_trace(go.Bar(
    x=df['Algorithm_Short'],
    y=df['Cost_Savings_Percentage'],
    name='Cost Save %',
    marker_color=colors[1],
    hovertemplate='<b>%{x}</b><br>Savings: %{y}%<br>Time: %{customdata} sec<extra></extra>',
    customdata=df['Computation_Time_seconds'],
    yaxis='y2'
))

# Update layout with dual y-axes
fig.update_layout(
    title='Route Algorithm Comparison',
    xaxis_title='Algorithm',
    yaxis=dict(
        title='Route Len (km)',
        side='left'
    ),
    yaxis2=dict(
        title='Cost Save %',
        side='right',
        overlaying='y'
    ),
    legend=dict(orientation='h', yanchor='bottom', y=1.05, xanchor='center', x=0.5),
    barmode='group'
)

# Save the chart
fig.write_image("route_algorithm_comparison.png")
