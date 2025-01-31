'use client';

import dynamic from 'next/dynamic';
import React from 'react';

// Dynamically import Plotly (so it doesn't break SSR)
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface IVSurfaceData {
  gridMNY: number[][];
  gridTTES: number[][];
  gridIVS: (number | string)[][]; 
}

interface GraphRendererProps {
  graphData: IVSurfaceData | null;
  title?: string;
}

export default function GraphRenderer({ graphData, title }: GraphRendererProps) {
  if (
    !graphData ||
    !graphData.gridMNY?.length ||
    !graphData.gridTTES?.length ||
    !graphData.gridIVS?.length
  ) {
    return <div className="text-red-500 text-center">No graph data to display.</div>;
  }

  // Convert "NaN", "Infinity", "-Infinity" strings to real numeric values
  const parseGridIVS = (grid: (number | string)[][]) => {
    return grid.map((row) => 
      row.map((val) => {
        if (typeof val === 'string') {
          if (val === 'NaN') return NaN;
          if (val === 'Infinity') return Infinity;
          if (val === '-Infinity') return -Infinity;
        }
        return val as number;
      })
    );
  };

  const zData = parseGridIVS(graphData.gridIVS);

  console.log('zData dimensions:', {
    rows: zData.length,
    cols: zData[0]?.length || 0
  });

  return (
    <div className="w-full h-full">
      <Plot
        data={[
          {
            type: 'surface',
            x: graphData.gridMNY, // 2D array (100x100)
            y: graphData.gridTTES, // 2D array (100x100)
            z: zData,              // 2D array (100x100)
            colorscale: 'Viridis',
          },
        ]}
        layout={{
          title: title || 'Implied Volatility Surface',
          autosize: true,
          scene: {
            xaxis: { title: 'Moneyness' },
            yaxis: { title: 'Time to Expiry' },
            zaxis: { title: 'Implied Vol' },
          },
        }}
        style={{ width: '100%', height: '100%' }}
        useResizeHandler={true}
      />
    </div>
  );
}
