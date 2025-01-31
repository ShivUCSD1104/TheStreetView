'use client';

import { useState } from 'react';
import GraphRenderer from './graphs/GraphRenderer';

interface Constraint {
  label: string;
  options: string[];
}

interface CardData {
  title: string;
  constraints: Constraint[];
}

interface IVSurfaceData {
  gridMNY: number[][];
  gridTTES: number[][];
  gridIVS: (number|string)[][];
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  cardData: CardData;
}

const Modal = ({ isOpen, onClose, cardData }: ModalProps) => {
  const [ivSurfaceData, setIvSurfaceData] = useState<IVSurfaceData | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const generateGraph = async () => {
    try {
      setLoading(true);
      setIvSurfaceData(null);

      // Hard-coded ticker or from user input
      const ticker = 'AAPL';

      const response = await fetch('http://localhost:5000/api/iv-surface-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch IV surface data');
      }

      const data = await response.json();
      console.log('Received IV Surface Data:', data);
      setIvSurfaceData(data);
    } catch (error) {
      console.error('Error fetching IV surface data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow max-w-6xl w-full p-6 h-3/4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex h-full items-center">
          {/* Left column with constraints */}
          <div className="flex flex-col items-center w-1/3">
            <h2 className="text-xl bg-gradient-to-r from-yellow-100 from-10% via-emerald-100 to-blue-100 to-90% text-black mb-4 text-center p-2 border border-black rounded-lg shadow-lg">
              {cardData.title}
            </h2>
            <div className="w-full p-4 rounded-lg shadow-lg hover:shadow-inner hover:shadow-gray-300">
              {cardData.constraints.map((constraint: Constraint, index: number) => (
                <div key={index} className="mb-4 w-full text-center">
                  <label className="block text-gray-600 mb-1">{constraint.label}</label>
                  <select className="w-full bg-white text-gray-600 p-2 rounded shadow-md hover:shadow-inner hover:shadow-gray-200">
                    {constraint.options.map((option: string, idx: number) => (
                      <option key={idx} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              ))}

              <button
                onClick={generateGraph}
                className="mt-4 w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Generate Graph
              </button>
            </div>
          </div>

          {/* Graphing area */}
          <div className="w-2/3 p-4 h-full flex flex-col">
            {loading && (
              <div className="flex-1 flex items-center justify-center">
                <span className="text-gray-500">Loading...</span>
              </div>
            )}

            {!loading && (
              <div className="bg-fuchsia-100 rounded-lg h-full flex justify-center items-center">
                {ivSurfaceData ? (
                  <GraphRenderer
                    graphData={ivSurfaceData}
                    title={cardData.title} 
                  />
                ) : (
                  <span className="text-emerald-500">
                    No graph generated yet.
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
