import sys
import os
from flask import Flask, request, jsonify
from flask_cors import CORS

IVSURFACE_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.insert(0, IVSURFACE_PATH)

from IVSurface.IVmap import generate_iv_surface_html

app = Flask(__name__)
CORS(app)

@app.route('/compute', methods=['POST'])
def compute():
    data = request.json
    parameters = data.get('parameters', {})

    # Perform your computation here
    computed_data = perform_computation(parameters)

    return jsonify(computed_data)

def perform_computation(parameters):
    """
    This function receives the JSON parameters from the Node server,
    calls our IVMap function, and returns the MPLD3 HTML.
    """
    ticker = parameters.get('Ticker', 'AAPL')
    start_date = parameters.get('Start Date', '1M')
    end_date = parameters.get('End Date', '3M')

    # Actually compute the IV surface & get HTML
    # html_str = generate_iv_surface_html(ticker, start_date, end_date)

    # # Return in JSON form
    # return {
    #     "mpld3_html": html_str
    # }
    fig_json = generate_iv_surface_html(ticker, start_date, end_date)
    
    return {
        "plotly_json": fig_json
    }


if __name__ == '__main__':
    app.run(port=5001)