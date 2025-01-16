import numpy as np
import pandas as pd
import plotly.graph_objects as go
from data import get_yield_data

START_DATE = pd.to_datetime('2024-07-01')
END_DATE = pd.to_datetime("2025-01-01")

x,y,z = get_yield_data(START_DATE, END_DATE)

# Create the 3D grid for plotting
x_grid, y_grid = np.meshgrid(x, y)

# Generate the 3D plot
fig = go.Figure(data=[go.Surface(
    z=z,  # Use the direct yield matrix
    x=x_grid,  # Maturities
    y=y_grid,  # Dates
    colorscale="Viridis",
    colorbar=dict(title="Yield (%)"),
)])

# Update layout
fig.update_layout(
    title="3D Interest Rate Term Structure",
    scene=dict(
        xaxis=dict(title="Maturity (Months)"),
        yaxis=dict(title="Date"),
        zaxis=dict(title="Yield (%)"),
    ),
    margin=dict(l=0, r=0, b=0, t=50),
)
# Display the plot
fig.show()