import React, { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame, ThreeElements, extend, Object3DNode, useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls, Stage, Text } from '@react-three/drei';
import './index.css';

import { Color, MathUtils } from 'three'

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
  const shipRef = useRef();

  useFrame((state, delta) => {
    shipRef.current.rotation.y += delta;
  })

  return (
    <primitive ref={shipRef} object={object.scene} scale={props.scale} position={props.position}/>
  )
}

function ShipLazySusan(props: any) {
  const lazySusanRef = useRef<any>();
  const [ targetRotation, setTargetRotation ] = React.useState(0);

  useFrame((state, delta) => {
    lazySusanRef.current.rotation.y = MathUtils.lerp(
      lazySusanRef.current.rotation.y,
      targetRotation,
      0.1
    )
  })

  function keepRotationInBounds(rotation: number) {
    while (rotation < 0) {
      rotation += 2 * Math.PI;
    }
    while (rotation >= 2 * Math.PI) {
      rotation -= 2 * Math.PI;
    }
    return rotation;
  }
  useEffect(() => {
    const handleKeyDown = (e: any) => {
      if (e.code === 'ArrowLeft') {
        setTargetRotation(keepRotationInBounds(targetRotation - Math.PI / 3))
      } else if (e.code === 'ArrowRight') {
        setTargetRotation(keepRotationInBounds(targetRotation + Math.PI/3))
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  return (
    <group ref={lazySusanRef}>
      <ShipSelectModel text={"Gemini"} model={"gemini/scene.gltf"} scale={0.06} position={[0, 0, 10]} />
      <ShipSelectModel text={"Virgo"} model={"virgo/scene.gltf"} scale={0.03} position={[-10 * Math.cos(Math.PI / 6), 0, -10 * Math.sin(Math.PI / 6)]} />
      <ShipSelectModel text={"Scorpio"} model={"scorpio/scene.gltf"} scale={0.2} position={[10 * Math.cos(Math.PI / 6), 0, -10 * Math.sin(Math.PI / 6)]} /> 
    </group>
  )
}

function App() {
  
  const [ selectedShip, setSelectedShip ] = React.useState<any>(undefined);

  return (
    <>
      <div style={{
        position: "absolute",
        left: window.innerWidth / 2,
        top: window.innerHeight / 2,
        fontFamily: 'Press Start 2P',
        fontSize: 40
      }}>
        test
      </div>
      <div style={{
        width: "100vw",
        height: "100vh"
      }}>
        <Canvas camera={{fov: 100}} style={{width: "100%", height: "100%"}} color={"black"}>
          <axesHelper />
          <OrbitControls />
          <ShipLazySusan />
          <Stage preset={"rembrandt"} adjustCamera={true}>
            
          </Stage>
        </Canvas>
      </div>
    </>
  );
}

export default App;
