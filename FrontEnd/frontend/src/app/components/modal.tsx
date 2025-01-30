"use client";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

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

interface ComputedData {
  grid_mny: number[][]; // 2D array, shape [rows, cols]
  grid_ttes: number[][]; // same shape
  grid_ivs: number[][];  // same shape
  bounds: {
    x: [number, number];
    y: [number, number];
    z: [number, number];
  };
  ticker: string;
  error?: string;
}

export default function Modal({ isOpen, onClose, cardData }: ModalProps) {
  // Selections for constraints
  const [selections, setSelections] = useState<Record<string, string>>({});
  // Computed IV data from your backend
  const [computedData, setComputedData] = useState<ComputedData | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Initialize constraint selections once
  useEffect(() => {
    const defaults: Record<string, string> = {};
    cardData.constraints.forEach((constraint) => {
      defaults[constraint.label] = constraint.options[0];
    });
    setSelections(defaults);
  }, [cardData.constraints]);

  /**
   * Set up 3D scene whenever we have data (computedData) and the modal is open.
   */
  useEffect(() => {
    if (!isOpen || !computedData || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      canvas.clientWidth / canvas.clientHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);

    // Extract data
    const { grid_mny, grid_ttes, grid_ivs, bounds } = computedData;
    const rows = grid_mny.length;
    const cols = grid_mny[0].length;

    // Ranges for normalization
    const xRange = bounds.x[1] - bounds.x[0] || 1e-6;
    const yRange = bounds.y[1] - bounds.y[0] || 1e-6;
    const zRange = bounds.z[1] - bounds.z[0] || 1e-6;

    // Build positions and indices
    const positions: number[] = [];
    const indices: number[] = [];

    // Flatten the data
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const rawX = grid_mny[i][j];
        const rawY = grid_ttes[i][j];
        const rawZ = grid_ivs[i][j];

        // Scale them for a nice scene
        const x = ((rawX - bounds.x[0]) / xRange) * 50;
        const y = ((rawY - bounds.y[0]) / yRange) * 50;
        const z = ((rawZ - bounds.z[0]) / zRange) * 10;

        positions.push(x, y, z);
      }
    }

    // Build indices for two triangles per cell
    for (let i = 0; i < rows - 1; i++) {
      for (let j = 0; j < cols - 1; j++) {
        const topLeft = i * cols + j;
        const bottomLeft = (i + 1) * cols + j;
        const topRight = i * cols + (j + 1);
        const bottomRight = (i + 1) * cols + (j + 1);

        // First triangle
        indices.push(topLeft, bottomLeft, bottomRight);
        // Second triangle
        indices.push(topLeft, bottomRight, topRight);
      }
    }

    // Build geometry
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3)
    );
    geometry.setIndex(new THREE.Uint32BufferAttribute(indices, 1));
    geometry.computeVertexNormals();

    // Material
    const material = new THREE.MeshPhongMaterial({
      color: 0x2194ce,
      wireframe: false,
      side: THREE.DoubleSide,
    });

    // Mesh
    const surface = new THREE.Mesh(geometry, material);
    scene.add(surface);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(0, 50, 50);
    scene.add(dirLight);

    // Camera positioning
    camera.position.set(25, 25, 50);
    camera.lookAt(new THREE.Vector3(25, 25, 0));

    // Animate
    const animate = () => {
      requestAnimationFrame(animate);
      surface.rotation.y += 0.002;
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup on unmount or re-render
    return () => {
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [computedData, isOpen]);

  /**
   * Fetch data from your API
   */
  const handleSubmit = async () => {
    try {
      const res = await fetch("/api/compute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: cardData.title,
          parameters: selections,
        }),
      });
      const data: ComputedData = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to compute");
      }
      setComputedData(data);
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : err}`);
    }
  };

  // Don’t render anything if closed
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-[8px_-8px_16px_rgba(255,255,255,0.7)] max-w-6xl w-full p-6 h-3/4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex h-full items-center">
          {/* LEFT SIDEBAR: Title, constraints, error, buttons */}
          <div className="flex flex-col items-center w-1/3 h-full">
            {/* Title */}
            <h2 className="text-xl bg-gradient-to-r from-yellow-100 from-10% via-emerald-100 to-blue-100 to-90% text-black mb-4 text-center p-2 border border-black rounded-lg shadow-lg">
              {cardData.title}
            </h2>

            {/* Error display (if any) */}
            {computedData?.error && (
              <div className="text-red-500 bg-red-50 border border-red-300 p-2 rounded mb-4">
                Error: {computedData.error}
              </div>
            )}

            {/* Constraints */}
            <div className="w-full p-4 rounded-lg shadow-lg hover:shadow-inner hover:shadow-gray-300 flex-1 overflow-y-auto">
              {cardData.constraints.map((constraint, index) => (
                <div key={index} className="mb-4 w-full text-center">
                  <label className="block text-gray-600 mb-1">
                    {constraint.label}
                  </label>
                  <select
                    className="w-full bg-white text-gray-600 p-2 rounded shadow-md hover:shadow-inner hover:shadow-gray-200"
                    value={selections[constraint.label]}
                    onChange={(e) =>
                      setSelections((prev) => ({
                        ...prev,
                        [constraint.label]: e.target.value,
                      }))
                    }
                  >
                    {constraint.options.map((option, idx) => (
                      <option key={idx} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            {/* Buttons */}
            <div className="mt-4 space-x-2">
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Generate Visualization
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>

          {/* RIGHT PANEL: 3D Canvas */}
          <div className="w-2/3 p-4 h-full">
            <div className="bg-fuchsia-100 rounded-lg h-full flex justify-center items-center">
              <canvas
                ref={canvasRef}
                className="w-full h-full bg-gray-100 rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
