"use client";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';


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
  grid_mny: number[][];
  grid_ttes: number[][];
  grid_ivs: number[][];
  bounds: {
    x: [number, number];
    y: [number, number];
    z: [number, number];
  };
  ticker: string;
  error?: string;
}

export default function Modal({ isOpen, onClose, cardData }: ModalProps) {
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [computedData, setComputedData] = useState<ComputedData | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const defaults: Record<string, string> = {};
    cardData.constraints.forEach((constraint) => {
      defaults[constraint.label] = constraint.options[0];
    });
    setSelections(defaults);
  }, [cardData.constraints]);

  function viridisColor(t: number): [number, number, number] {
    const stops = [
      { t: 0.0, color: [0.267, 0.004, 0.329] },
      { t: 0.33, color: [0.127, 0.566, 0.55] },
      { t: 0.66, color: [0.369, 0.788, 0.382] },
      { t: 1.0, color: [0.993, 0.906, 0.144] },
    ];
    
    for (let i = 0; i < stops.length - 1; i++) {
      if (t >= stops[i].t && t <= stops[i+1].t) {
        const span = stops[i+1].t - stops[i].t;
        const alpha = (t - stops[i].t) / span;
        const c0 = stops[i].color;
        const c1 = stops[i+1].color;
        return [
          c0[0] + alpha * (c1[0] - c0[0]),
          c0[1] + alpha * (c1[1] - c0[1]),
          c0[2] + alpha * (c1[2] - c0[2]),
        ];
      }
    }
    return stops[stops.length - 1].color as [number, number, number];
  }

  const initScene = () => {
    if (!canvasRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, canvasRef.current.clientWidth / canvasRef.current.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
      canvas: canvasRef.current,
      antialias: true,
      alpha: true
    });

    renderer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // Match matplotlib's default view: elev=30, azim=120
    camera.position.set(-5, 7, 7);
    camera.lookAt(0, 0, 0);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
    dirLight.position.set(30, 50, 40);
    scene.add(dirLight);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 3;
    controls.maxDistance = 50;

    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;
    controlsRef.current = controls;

    return () => {
      renderer.dispose();
      controls.dispose();
    };
  };

  const createSurfaceMesh = (data: ComputedData) => {
    if (!sceneRef.current) return;

    // Clear previous scene elements
    sceneRef.current.children.forEach(child => {
      if (child instanceof THREE.Mesh || child instanceof THREE.AxesHelper || child instanceof THREE.Sprite) {
        sceneRef.current?.remove(child);
      }
    });

    const { grid_mny, grid_ttes, grid_ivs, bounds } = data;
    const rows = grid_mny.length;
    const cols = grid_mny[0].length;

    // Normalize ranges for proper scaling
    const xRange = bounds.x[1] - bounds.x[0];
    const yRange = bounds.y[1] - bounds.y[0];
    const zRange = bounds.z[1] - bounds.z[0];
    const maxRange = Math.max(xRange, yRange, zRange);
    const scaleFactor = 7 / maxRange; // Adjust this to control overall size

    // Create geometry with normalized scaling
    const vertices = new Float32Array(rows * cols * 3);
    const colors = new Float32Array(rows * cols * 3);
    const indices = [];

    let vertexIndex = 0;
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        // Normalize coordinates to [0-1] range then scale
        const x = (grid_mny[i][j] - bounds.x[0]) / xRange * scaleFactor;
        const y = (grid_ttes[i][j] - bounds.y[0]) / yRange * scaleFactor;
        const z = (grid_ivs[i][j] - bounds.z[0]) / zRange * scaleFactor;

        vertices[vertexIndex * 3] = x - scaleFactor/2; // Center X
        vertices[vertexIndex * 3 + 1] = y; // Keep Y at bottom
        vertices[vertexIndex * 3 + 2] = z;

        const t = (grid_ivs[i][j] - bounds.z[0]) / zRange;
        const [r, g, b] = viridisColor(t);
        colors[vertexIndex * 3] = r;
        colors[vertexIndex * 3 + 1] = g;
        colors[vertexIndex * 3 + 2] = b;

        vertexIndex++;
      }
    }

    // Generate indices for triangle mesh
    for (let i = 0; i < rows - 1; i++) {
      for (let j = 0; j < cols - 1; j++) {
        const a = i * cols + j;
        const b = i * cols + j + 1;
        const c = (i + 1) * cols + j + 1;
        const d = (i + 1) * cols + j;

        indices.push(a, b, d);
        indices.push(b, c, d);
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    const material = new THREE.MeshPhongMaterial({
      vertexColors: true,
      shininess: 50,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85
    });

    const surfaceMesh = new THREE.Mesh(geometry, material);
    sceneRef.current.add(surfaceMesh);

    // Add scaled axes
    const axesHelper = new THREE.AxesHelper(scaleFactor * 1.2);
    sceneRef.current.add(axesHelper);

    // Axis labels with proper scaling
    const createLabel = (text: string, position: THREE.Vector3) => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 128;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#000000';
      ctx.font = '18px Arial';
      ctx.fillText(text, 10, 30);

      const texture = new THREE.CanvasTexture(canvas);
      const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.scale.set(0.5, 0.25, 1);
      sprite.position.copy(position);
      sceneRef.current?.add(sprite);
    };

    createLabel('Moneyness', new THREE.Vector3(scaleFactor/2, -0.1, 0));
    createLabel('Time to Expiry', new THREE.Vector3(-0.1, scaleFactor * 1.1, 0));
    createLabel('Implied Vol', new THREE.Vector3(-0.1, 0, scaleFactor * 1.1));

  };

  useEffect(() => {
    if (!isOpen || !computedData) return;

    const cleanup = initScene();
    createSurfaceMesh(computedData);

    const animate = () => {
      if (!rendererRef.current || !cameraRef.current || !sceneRef.current) return;
      controlsRef.current?.update();
      rendererRef.current.render(sceneRef.current, cameraRef.current);
      requestAnimationFrame(animate);
    };
    animate();

    return cleanup;
  }, [computedData, isOpen]);

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
      if (!res.ok) throw new Error(data.error || "Failed to compute");
      setComputedData(data);
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : err}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-[8px_-8px_16px_rgba(255,255,255,0.7)] max-w-6xl w-full p-6 h-3/4" 
           onClick={(e) => e.stopPropagation()}>
        <div className="flex h-full items-center">
          <div className="flex flex-col items-center w-1/3 h-full">
            <h2 className="text-xl bg-gradient-to-r from-yellow-100 from-10% via-emerald-100 to-blue-100 to-90% text-black mb-4 text-center p-2 border border-black rounded-lg shadow-lg">
              {cardData.title}
            </h2>

            {computedData?.error && (
              <div className="text-red-500 bg-red-50 border border-red-300 p-2 rounded mb-4">
                Error: {computedData.error}
              </div>
            )}

            <div className="w-full p-4 rounded-lg shadow-lg hover:shadow-inner hover:shadow-gray-300 flex-1 overflow-y-auto">
              {cardData.constraints.map((constraint, index) => (
                <div key={index} className="mb-4 w-full text-center">
                  <label className="block text-gray-600 mb-1">{constraint.label}</label>
                  <select
                    className="w-full bg-white text-gray-600 p-2 rounded shadow-md hover:shadow-inner hover:shadow-gray-200"
                    value={selections[constraint.label]}
                    onChange={(e) => setSelections(prev => ({ ...prev, [constraint.label]: e.target.value }))}
                  >
                    {constraint.options.map((option, idx) => (
                      <option key={idx} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            <div className="mt-4 space-x-2">
              <button onClick={handleSubmit} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                Generate Visualization
              </button>
              <button onClick={onClose} className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors">
                Close
              </button>
            </div>
          </div>

          <div className="w-2/3 p-4 h-full">
            <div className="bg-fuchsia-100 rounded-lg h-full flex justify-center items-center">
              <canvas ref={canvasRef} className="w-full h-full bg-gray-100 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
