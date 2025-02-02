'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Plot from 'react-plotly.js';
import Slider from '@mui/material/Slider';
import { styled } from '@mui/material/styles';

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

const CustomSlider = styled(Slider)({
  color: '#3B82F6',
  height: 4,
  '& .MuiSlider-thumb': {
    width: 20,
    height: 20,
    backgroundColor: '#fff',
    border: '2px solid currentColor',
  },
  '& .MuiSlider-valueLabel': {
    display: 'none',
  },
});

const Modal = ({ isOpen, onClose, cardData }: ModalProps) => {
  const [selections, setSelections] = useState<{ [key: string]: string }>({});
  const [plotData, setPlotData] = useState<any>(null);

  useEffect(() => {
    const oneDayFuture = new Date();
    oneDayFuture.setDate(oneDayFuture.getDate() + 1);
    const twoYearsFuture = new Date();
    twoYearsFuture.setFullYear(twoYearsFuture.getFullYear() + 2);
    setSelections(prev => ({
      ...prev,
      'Start Date': prev['Start Date'] || oneDayFuture.toISOString().split('T')[0],
      'End Date': prev['End Date'] || twoYearsFuture.toISOString().split('T')[0],
    }));
  }, []);

  const handleSelectionChange = (label: string, value: string) => {
    setSelections((prev) => ({ ...prev, [label]: value }));
  };

  const computeGraph = async () => {
    try {
      const parameters: any = {};
      cardData.constraints.forEach((constraint) => {
        if (constraint.label === 'Time Period') {
          const oneDayFuture = new Date();
          oneDayFuture.setDate(oneDayFuture.getDate() + 1);
          const twoYearsFuture = new Date();
          twoYearsFuture.setFullYear(twoYearsFuture.getFullYear() + 2);
          parameters['Start Date'] = selections['Start Date'] || oneDayFuture.toISOString().split('T')[0];
          parameters['End Date'] = selections['End Date'] || twoYearsFuture.toISOString().split('T')[0];
        } else {
          parameters[constraint.label] = selections[constraint.label] || constraint.options[0];
        }
      });
      const res = await axios.post('http://localhost:5000/api/compute', { parameters });
      if (res.data.plotly_json) {
        setPlotData(JSON.parse(res.data.plotly_json));
      }
    } catch (err) {
      console.error(err);
      setPlotData(null);
    }
  };

  if (!isOpen) return null;

  const oneDayFuture = new Date();
  oneDayFuture.setDate(oneDayFuture.getDate() + 1);
  const twoYearsFuture = new Date();
  twoYearsFuture.setFullYear(twoYearsFuture.getFullYear() + 2);

  const startDateStr = selections['Start Date'] || oneDayFuture.toISOString().split('T')[0];
  const endDateStr = selections['End Date'] || twoYearsFuture.toISOString().split('T')[0];

  const minTimestamp = oneDayFuture.getTime();
  const maxTimestamp = twoYearsFuture.getTime();
  const startDay = Math.floor((new Date(startDateStr).getTime() - minTimestamp) / 86400000);
  const endDay = Math.floor((new Date(endDateStr).getTime() - minTimestamp) / 86400000);
  const totalDays = Math.floor((maxTimestamp - minTimestamp) / 86400000);


  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-8px_-8px_16px_rgba(255,255,255,0.7)] max-w-6xl w-full p-6 h-3/4" onClick={(e) => e.stopPropagation()}>
        <div className="flex h-full items-center">
          <div className="flex flex-col items-center w-1/3">
            {/* ... (existing title and UI elements remain unchanged) */}
            <div className="w-full p-4 rounded-lg shadow-lg hover:shadow-inner hover:shadow-gray-300">
              {cardData.constraints.map((constraint: Constraint, index: number) => (
                <div key={index} className="mb-4 w-full text-center">
                  <label className="block text-gray-600 mb-1">{constraint.label}</label>
                  {constraint.label === 'Time Period' ? (
                    <div className="mt-4">
                      <CustomSlider
                        value={[startDay, endDay]}
                        onChange={(_, values, activeThumb) => {
                          // Ensure values is an array
                          const newValues = values as number[];
                          // Only update the value for the thumb being dragged.
                          if (activeThumb === 0) {
                            const newStartDate = new Date(minTimestamp + newValues[0] * 86400000);
                            setSelections((prev) => ({
                              ...prev,
                              'Start Date': newStartDate.toISOString().split('T')[0],
                            }));
                          } else if (activeThumb === 1) {
                            const newEndDate = new Date(minTimestamp + newValues[1] * 86400000);
                            setSelections((prev) => ({
                              ...prev,
                              'End Date': newEndDate.toISOString().split('T')[0],
                            }));
                          }
                        }}
                        min={0}
                        max={totalDays}
                        valueLabelDisplay="off"
                        disableSwap
                      />
                      <div className="flex justify-between text-sm text-gray-600 mt-2">
                        <span>{startDateStr}</span>
                        <span>{endDateStr}</span>
                      </div>
                    </div>
                  ) : (
                    <select
                      className="w-full bg-white text-gray-600 p-2 rounded shadow-md hover:shadow-inner hover:shadow-gray-200"
                      value={selections[constraint.label] || constraint.options[0]}
                      onChange={(e) => handleSelectionChange(constraint.label, e.target.value)}
                    >
                      {constraint.options.map((option: string, idx: number) => (
                        <option key={idx} value={option}>{option}</option>
                      ))}
                    </select>
                  )}
                </div>
              ))}
            </div>
            <button onClick={computeGraph} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600">
              Compute
            </button>
          </div>
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