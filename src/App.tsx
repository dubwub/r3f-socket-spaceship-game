import React, { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame, ThreeElements, extend, Object3DNode, useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls, Stage } from '@react-three/drei';

const usePersonControls = () => {
  const keys: any = {
    ArrowLeft: 'left',
    ArrowRight: 'right',
  }

  const moveFieldByKey = (key: string) => keys[key]

  const [movement, setMovement] = useState({
    left: false,
    right: false,
  })

  useEffect(() => {
    const handleKeyDown = (e: any) => {
      setMovement((m) => ({ ...m, [moveFieldByKey(e.code)]: true }))
    }
    const handleKeyUp = (e: any) => {
      setMovement((m) => ({ ...m, [moveFieldByKey(e.code)]: false }))
    }
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('keyup', handleKeyUp)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('keyup', handleKeyUp)
    }
  }, [])
  return movement
}

// props:
// isSelected = true (add a little aura below, make bigger, otherwise, greyscale)
// x,y,z
function ShipSelectModel(props: any) {
  const object = useLoader(GLTFLoader, props.model);
  console.log(object);
  return <primitive object={object.scene} scale={[0.1, 0.1, 0.1]} position={props.position}/>
}

function App() {
  
  const [ selectedShip, setSelectedShip ] = React.useState<any>(undefined);

  return (
    <div style={{
      width: "100vw",
      height: "100vh"
    }}>
      <Canvas camera={{fov: 100}} style={{width: "100%", height: "100%"}}>
        <axesHelper />
        <OrbitControls />
        <ShipSelectModel model={"gemini/scene.gltf"} position={[-10, 0, 0]} />
          <ShipSelectModel model={"virgo/scene.gltf"} position={[0, 0, 0]} />
          <ShipSelectModel model={"scorpio/scene.gltf"} position={[10, 0, 0]} />  
        <Stage preset={"rembrandt"} adjustCamera={true}>
          
        </Stage>
      </Canvas>
    </div>
  );
}

export default App;
