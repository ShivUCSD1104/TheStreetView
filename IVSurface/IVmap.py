import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D
from scipy.interpolate import griddata
import numpy as np
from BSMCompute import compute_implied_vols

# Choose a ticker symbol
ticker_symbol = "NVDA"

# Compute implied vols, moneyness, time-to-expiry for CALLS
ivs_calls, mny_calls, ttes_calls = compute_implied_vols(ticker_symbol, contract_type="calls")

filtered_calls = [
    (iv, m, tte) 
    for (iv, m, tte) in zip(ivs_calls, mny_calls, ttes_calls)
    if -7 <= m <= 7
]

ivs_calls_filtered, mny_calls_filtered, ttes_calls_filtered = zip(*filtered_calls)

# Compute implied vols, moneyness, time-to-expiry for PUTS
ivs_puts, mny_puts, ttes_puts = compute_implied_vols(ticker_symbol, contract_type="puts")

filtered_puts = [
    (iv, m, tte) 
    for (iv, m, tte) in zip(ivs_puts, mny_puts, ttes_puts)
    if -7 <= m <= 7
]

ivs_puts_filtered, mny_puts_filtered, ttes_puts_filtered = zip(*filtered_puts)

# Combined data
ivs = np.array(ivs_calls_filtered + ivs_puts_filtered)
mny = np.array(mny_calls_filtered + mny_puts_filtered)
ttes = np.array(ttes_calls_filtered + ttes_puts_filtered)

# Create grid data for interpolation
grid_mny, grid_ttes = np.meshgrid(
    np.linspace(min(mny), max(mny), 100),
    np.linspace(min(ttes), max(ttes), 100)
)
grid_ivs = griddata((mny, ttes), ivs, (grid_mny, grid_ttes), method='cubic')

fig = plt.figure(figsize=(12, 8), dpi=100)
ax = fig.add_subplot(111, projection='3d')

# Plot the surface
surf = ax.plot_surface(grid_mny, grid_ttes, grid_ivs, cmap='viridis', edgecolor='none', alpha=0.8)

# Customize the color bar
cbar = fig.colorbar(surf, ax=ax, shrink=0.5, aspect=5, pad=0.1)
cbar.set_label("Implied Volatility", rotation=270, labelpad=15)

# Set axis labels and limits
ax.set_xlabel("Moneyness (S/K or K/S)")
ax.set_ylabel("Time to Expiry (Years)")
ax.set_zlabel("Implied Volatility")

# Set axis limits for better scaling
ax.set_xlim(min(mny), max(mny))
ax.set_ylim(min(ttes), max(ttes))
ax.set_zlim(min(ivs), max(ivs)-3)

# Set a better viewing angle
ax.view_init(elev=30, azim=120)

# Add a grid for better readability
ax.grid(True)

plt.title(f"Implied Volatility Surface for {ticker_symbol}")

plt.tight_layout()
plt.show()