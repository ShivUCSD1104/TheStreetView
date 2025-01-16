import plotly.graph_objects as go
import numpy as np
import pandas as pd
from data import get_data

TICKER = 'TSLA'
DAYS = 5

apx, bpx, avc, bvc, times = get_data(TICKER, DAYS)

op = 0.8
scaler = 8
inds = np.arange(500, len(apx), scaler)

fig = go.Figure(data = [
  go.Surface(x=apx[inds], 
             y=np.arange(len(apx[inds])), 
             z=avc[inds],
             colorscale = 'OrRd', 
             opacity=op
             )])

fig.add_surface(
    x=bpx[inds], 
    y=np.arange(len(bpx[inds])), 
    z=bvc[inds],
    colorscale = 'BuGn', 
    opacity=op
  )

#change the scaling/limits for the axes
fig.update_layout(scene = dict(
    xaxis = dict(nticks=4, range=[min(apx[inds].min(), bpx[inds].min()), max(apx[inds].max(), bpx[inds].max())],),
    yaxis = dict(nticks=4, range=[0, len(apx[inds])],),
    zaxis = dict(nticks=4, range=[0, max(avc[inds].max(), bvc[inds].max())],),),
    margin=dict(l=0, r=0, b=0, t=0))

fig.update_layout(
    title=f"Orderflow Ravine for ${TICKER} for the last {DAYS-1} days",
    scene=dict(
        xaxis_title="Price",
        yaxis_title="Time",
        zaxis_title="CumulativeVolume"
    )
)

fig.show()

