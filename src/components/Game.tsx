import { Stage, Container, Sprite, Graphics } from '@pixi/react'
import { type FC, useState, useCallback, useEffect } from 'react'
import styled from 'styled-components'
import * as PIXI from 'pixi.js'

const GameContainer = styled.div`
  width: 100vw;
  height: 100vh;
  background-color: #87CEEB;
  position: relative;
`;

const Controls = styled.div`
  position: absolute;
  top: 20px;
  left: 20px;
  background: rgba(255, 255, 255, 0.9);
  padding: 20px;
  border-radius: 8px;
  z-index: 1000;
`;

const GameTitle = styled.h1`
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  color: white;
  font-size: 2.5rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  margin: 0;
`;

const Button = styled.button`
  padding: 8px 16px;
  margin: 4px;
  border: none;
  border-radius: 4px;
  background: #4CAF50;
  color: white;
  cursor: pointer;
  
  &:hover {
    background: #45a049;
  }
`;

const GRID_SIZE = 50; // Größe einer Rasterzelle
const GRID_COLOR = 0x333333; // grau für das Raster
const GRID_ALPHA = 0.3; // Transparenz des Rasters

interface PreviewPosition {
  x: number;
  y: number;
  isValid: boolean;
  rotation: number;
  targetRotation: number;
}

interface GameObject {
  x: number;
  y: number;
  type: 'house' | 'store' | 'factory' | 'road';
  rotation: number;
}

type BuildingType = 'house' | 'store' | 'factory';

const Game: FC = () => {
  const [buildings, setBuildings] = useState<GameObject[]>([]);
  const [roads, setRoads] = useState<GameObject[]>([]);
  const [currentTool, setCurrentTool] = useState<'building' | 'road'>('building');
  const [currentBuildingType, setCurrentBuildingType] = useState<BuildingType>('house');
  const [previewPos, setPreviewPos] = useState<PreviewPosition | null>(null);

  // Funktion zum Zeichnen des Rasters
  const drawGrid = useCallback((g: PIXI.Graphics) => {
    g.clear();
    g.lineStyle(1, GRID_COLOR, GRID_ALPHA);

    // Vertikale Linien
    for (let x = 0; x <= window.innerWidth; x += GRID_SIZE) {
      g.moveTo(x, 0);
      g.lineTo(x, window.innerHeight);
    }

    // Horizontale Linien
    for (let y = 0; y <= window.innerHeight; y += GRID_SIZE) {
      g.moveTo(0, y);
      g.lineTo(window.innerWidth, y);
    }
  }, []);
  
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!previewPos) return;

      let newTargetRotation = previewPos.targetRotation;
      
      if (e.key.toLowerCase() === 'r') {
        // Rotation im Uhrzeigersinn (90 Grad)
        newTargetRotation = (previewPos.targetRotation + 90) % 360;
      } else if (e.key.toLowerCase() === 'e') {
        // Rotation gegen den Uhrzeigersinn (90 Grad)
        newTargetRotation = (previewPos.targetRotation - 90 + 360) % 360;
      } else {
        return;
      }

      setPreviewPos({
        ...previewPos,
        targetRotation: newTargetRotation
      });
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [previewPos]);

  // Animation Effect für die Rotation
  useEffect(() => {
    if (!previewPos) return;

    const animationStep = () => {
      setPreviewPos(prev => {
        if (!prev) return null;
        
        const diff = prev.targetRotation - prev.rotation;
        if (Math.abs(diff) < 1) {
          return {
            ...prev,
            rotation: prev.targetRotation
          };
        }

        // Sanfte Animation mit einer Geschwindigkeit von 10% des verbleibenden Wegs
        const newRotation = prev.rotation + (diff * 0.1);
        
        return {
          ...prev,
          rotation: newRotation
        };
      });
    };

    const animationId = requestAnimationFrame(animationStep);
    return () => cancelAnimationFrame(animationId);
  }, [previewPos]);

  const updatePreviewPosition = (e: React.MouseEvent) => {
    const bounds = e.currentTarget.getBoundingClientRect();
    const rawX = e.clientX - bounds.left;
    const rawY = e.clientY - bounds.top;
    
    // Berechne die nächstgelegene Rasterzelle
    const x = Math.floor(rawX / GRID_SIZE) * GRID_SIZE + GRID_SIZE / 2;
    const y = Math.floor(rawY / GRID_SIZE) * GRID_SIZE + GRID_SIZE / 2;
    
    // Prüfe, ob an dieser Position bereits etwas platziert wurde
    const isOccupied = [...buildings, ...roads].some(
      item => Math.abs(item.x - x) < 5 && Math.abs(item.y - y) < 5
    );

    setPreviewPos(prev => ({
      x,
      y,
      isValid: !isOccupied,
      rotation: prev?.rotation || 0,
      targetRotation: prev?.targetRotation || 0
    }));
  };

  const handleClick = () => {
    if (!previewPos || !previewPos.isValid) return;
    
    const { x, y, rotation } = previewPos;
    
    if (currentTool === 'building') {
      setBuildings([...buildings, { x, y, type: currentBuildingType, rotation }]);
    } else {
      setRoads([...roads, { x, y, type: 'road', rotation }]);
    }
  };

  const clearAll = () => {
    setBuildings([]);
    setRoads([]);
  };

  return (
    <GameContainer>
      <GameTitle>Aerp Town</GameTitle>
      <Controls>
        <div style={{ marginBottom: '10px' }}>
          <Button onClick={() => setCurrentTool('building')} 
                  style={{ background: currentTool === 'building' ? '#45a049' : '#4CAF50' }}>
            Place Building
          </Button>
          <Button onClick={() => setCurrentTool('road')}
                  style={{ background: currentTool === 'road' ? '#45a049' : '#4CAF50' }}>
            Place Road
          </Button>
        </div>
        
        {currentTool === 'building' && (
          <div style={{ marginBottom: '10px' }}>
            <Button 
              onClick={() => setCurrentBuildingType('house')}
              style={{ background: currentBuildingType === 'house' ? '#3F51B5' : '#5C6BC0' }}>
              House
            </Button>
            <Button 
              onClick={() => setCurrentBuildingType('store')}
              style={{ background: currentBuildingType === 'store' ? '#3F51B5' : '#5C6BC0' }}>
              Store
            </Button>
            <Button 
              onClick={() => setCurrentBuildingType('factory')}
              style={{ background: currentBuildingType === 'factory' ? '#3F51B5' : '#5C6BC0' }}>
              Factory
            </Button>
          </div>
        )}

        <Button onClick={clearAll} style={{ background: '#f44336' }}>
          Clear All
        </Button>
      </Controls>
      
            <Stage 
        width={window.innerWidth} 
        height={window.innerHeight} 
        options={{ 
          backgroundColor: 0x87CEEB,
          resolution: window.devicePixelRatio || 1,
          antialias: true
        }}
        onClick={handleClick}
        onMouseMove={updatePreviewPosition}
      >
        <Container>
          <Graphics draw={drawGrid} />
          
          {/* Render buildings */}
          {buildings.map((building, index) => (
            <Sprite
              key={index}
              image={`/assets/${building.type}.svg`}
              x={building.x}
              y={building.y}
              anchor={0.5}
              width={50}
              height={50}
              angle={building.rotation}
            />
          ))}
          
          {/* Render roads */}
          {roads.map((road, index) => (
            <Sprite
              key={index}
              image="/assets/road.svg"
              x={road.x}
              y={road.y}
              anchor={0.5}
              width={50}
              height={50}
              angle={road.rotation}
            />
          ))}

          {/* Render preview */}
          {previewPos && (
            <Sprite
              image={currentTool === 'building' ? "/assets/house.svg" : "/assets/road.svg"}
              x={previewPos.x}
              y={previewPos.y}
              anchor={0.5}
              width={50}
              height={50}
              alpha={0.5}
              angle={previewPos.rotation}
              tint={previewPos.isValid ? 0x00FF00 : 0xFF0000}
            />
          )}
        </Container>
      </Stage>
    </GameContainer>
  );
};

export default Game;
