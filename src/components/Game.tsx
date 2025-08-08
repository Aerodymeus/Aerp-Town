import { Stage, Container, Sprite, Graphics } from '@pixi/react'
import { type FC, useState, useCallback } from 'react'
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
const GRID_COLOR = 0xCCCCCC; // Hellgrau für das Raster
const GRID_ALPHA = 0.3; // Transparenz des Rasters

const Game: FC = () => {
  const [buildings, setBuildings] = useState<Array<{ x: number; y: number; type: string }>>([]);
  const [roads, setRoads] = useState<Array<{ x: number; y: number }>>([]);
  const [currentTool, setCurrentTool] = useState<'building' | 'road'>('building');

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
  
  const handleClick = (e: React.MouseEvent) => {
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

    if (!isOccupied) {
      if (currentTool === 'building') {
        setBuildings([...buildings, { x, y, type: 'house' }]);
      } else {
        setRoads([...roads, { x, y }]);
      }
    }
  };

  const clearAll = () => {
    setBuildings([]);
    setRoads([]);
  };

  return (
    <GameContainer>
      <Controls>
        <Button onClick={() => setCurrentTool('building')} 
                style={{ background: currentTool === 'building' ? '#45a049' : '#4CAF50' }}>
          Place Building
        </Button>
        <Button onClick={() => setCurrentTool('road')}
                style={{ background: currentTool === 'road' ? '#45a049' : '#4CAF50' }}>
          Place Road
        </Button>
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
      >
        <Container>
          <Graphics draw={drawGrid} />
          {/* Render buildings */}
          {buildings.map((building, index) => (
            <Sprite
              key={index}
              image="/assets/house.svg"
              x={building.x}
              y={building.y}
              anchor={0.5}
              width={50}
              height={50}
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
            />
          ))}
        </Container>
      </Stage>
    </GameContainer>
  );
};

export default Game;
