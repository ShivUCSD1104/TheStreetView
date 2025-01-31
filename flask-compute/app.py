import sys
import os
from flask import Flask, request, jsonify
from flask_cors import CORS

import numpy as np
from flask.json.provider import DefaultJSONProvider

IVSURFACE_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.insert(0, IVSURFACE_PATH)

# Import the utility that returns the IV Surface data
from IVSurface.IVMap.iv_map_utils import get_iv_surface_data

class CustomJSONProvider(DefaultJSONProvider):
    """Handles NaN/Inf by converting them to strings Plotly recognizes."""
    def default(self, obj):
        if isinstance(obj, float):
            if np.isnan(obj):
                return 'NaN'  # Plotly will parse this as NaN
            elif obj == float('inf'):
                return 'Infinity'
            elif obj == float('-inf'):
                return '-Infinity'
        return super().default(obj)

app = Flask(__name__)
CORS(app)
app.json = CustomJSONProvider(app)

@app.route('/compute', methods=['POST'])
def compute():
    """
    Example placeholder endpoint for other computations.
    """
    data = request.json
    parameters = data.get('parameters', {})
    computed_data = perform_computation(parameters)
    return jsonify(computed_data)

def perform_computation(parameters):
    """
    You can implement your logic here or remove this if not needed.
    """
    # Example: just echo back parameters
    return {"echo": parameters}

@app.route('/iv-surface-data', methods=['POST'])
def iv_surface_data():
    """
    Returns the grid data for the implied volatility surface
    in JSON format that the frontend can consume.
    """
    data = request.json
    ticker = data.get("ticker", "AAPL")
    iv_surface = get_iv_surface_data(ticker)
    
    print(f"Debug: Returning IV surface data for {ticker}")
    return jsonify(iv_surface)

if __name__ == '__main__':
    app.run(port=5001, debug=True)
