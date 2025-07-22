import pandas as pd
import plotly.graph_objects as go

# Load the data
df = pd.read_csv("case_studies_performance.csv")

# Display the data structure to understand what we're working with
print("Data columns:", df.columns.tolist())
print("\nFirst few rows:")
print(df.head())
print("\nData shape:", df.shape)

# Define the companies and metrics
companies = ['Amazon', 'Walmart', 'UPS ORION', 'DHL', 'FedEx']

# Create the figure
fig = go.Figure()

# Define colors for the three metrics (using the brand colors)
colors = ['#1FB8CD', '#DB4545', '#2E8B57']
metric_names = ['Cost Reduction', 'Delivery Time', 'Fuel Savings']

# Filter data for the specified companies
df_filtered = df[df['Company'].isin(companies)]

# Create grouped horizontal bar chart
metric_columns = ['Cost_Reduction_Percentage', 'Delivery_Time_Improvement_Percentage', 'Fuel_Savings_Percentage']

for i, metric in enumerate(metric_columns):
    if metric in df.columns:
        fig.add_trace(go.Bar(
            name=metric_names[i],
            y=df_filtered['Company'],
            x=df_filtered[metric],
            orientation='h',
            marker=dict(color=colors[i]),
            text=[f'{val}%' for val in df_filtered[metric]],
            textposition='outside',
            cliponaxis=False
        ))

# Update layout
fig.update_layout(
    title="Supply Chain Optimization Results",
    xaxis_title="% Improvement",
    yaxis_title="Companies",
    barmode='group',
    legend=dict(orientation='h', yanchor='bottom', y=1.05, xanchor='center', x=0.5)
)

# Save the chart
fig.write_image("supply_chain_optimization_chart.png")
fig.show()
