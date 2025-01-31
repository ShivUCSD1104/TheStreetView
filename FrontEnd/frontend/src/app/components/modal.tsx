'use client';

import React, { useState } from 'react';
import axios from 'axios';
import Plot from 'react-plotly.js';


interface Constraint {
  label: string;
  options: string[];
}

interface CardData {
  title: string;
  constraints: Constraint[];
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  cardData: CardData;
}

const Modal = ({ isOpen, onClose, cardData }: ModalProps) => {
  const [selections, setSelections] = useState<{ [key: string]: string }>({});
  const [mpld3Html, setMpld3Html] = useState<string>(""); // to store the HTML from the server
  const [plotData, setPlotData] = useState<any>(null);

  if (!isOpen) return null;

  const handleSelectionChange = (label: string, value: string) => {
    setSelections((prev) => ({
      ...prev,
      [label]: value,
    }));
  };

  const computeGraph = async () => {
    try {
      const parameters: any = {};
      cardData.constraints.forEach((constraint) => {
        const labelKey = constraint.label;
        parameters[labelKey] = selections[labelKey] || constraint.options[0];
      });

      const res = await axios.post('http://localhost:5000/api/compute', {
          parameters,
        });

        if (res.data.plotly_json) {
          setPlotData(JSON.parse(res.data.plotly_json));
        }
      } catch (err) {
        console.error(err);
        setPlotData(null);
      }
    };

  return (
    <div
      className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-8px_-8px_16px_rgba(255,255,255,0.7)] max-w-6xl w-full p-6 h-3/4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex h-full items-center">
          {/* Sidebar for constraints */}
          <div className="flex flex-col items-center w-1/3">
            <h2 className="text-xl bg-gradient-to-r from-yellow-100 from-10% via-emerald-100 to-blue-100 to-90% text-black mb-4 text-center p-2 border border-black rounded-lg shadow-lg">
              {cardData.title}
            </h2>
            <div className="w-full p-4 rounded-lg shadow-lg hover:shadow-inner hover:shadow-gray-300">
              {cardData.constraints.map((constraint: Constraint, index: number) => (
                <div key={index} className="mb-4 w-full text-center">
                  <label className="block text-gray-600 mb-1">{constraint.label}</label>
                  <select
                    className="w-full bg-white text-gray-600 p-2 rounded shadow-md hover:shadow-inner hover:shadow-gray-200"
                    onChange={(e) => handleSelectionChange(constraint.label, e.target.value)}
                  >
                    {constraint.options.map((option: string, idx: number) => (
                      <option key={idx} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            {/* Compute button */}
            <button
              onClick={computeGraph}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600"
            >
              Compute
            </button>
          </div>

          {/* Graphing area */}
          <div className="w-2/3 p-4 h-full">
            <div className="bg-fuchsia-100 rounded-lg h-full flex justify-center items-center overflow-auto">
              {plotData ? (
                <Plot
                  data={plotData.data}
                  layout={plotData.layout}
                  config={{ responsive: true }}
                  style={{ width: '100%', height: '100%' }}
                />
              ) : (
                <span className="text-emerald-500">Graph Visualization Here</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
