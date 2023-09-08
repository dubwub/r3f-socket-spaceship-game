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
  const object: any = useLoader(GLTFLoader, props.model);
  const shipRef = useRef<any>();

  useFrame((state, delta) => {
    if (typeof shipRef.current === "undefined") { return; }
    shipRef.current.rotation.y += delta;
  })

  return (
    <primitive ref={shipRef} object={object.scene} scale={props.scale} position={props.position}/>
  )
}

function ShipLazySusan(props: any) {
  const lazySusanRef = useRef<any>();
  const [ targetRotation, setTargetRotation ] = React.useState(0);
  
  const [ selectedIndex, setSelectedIndex ] = React.useState(0); // default gemini
  const ships = [
    "Gemini",
    "Virgo",
    "Scorpio"
  ]


  useFrame((state, delta) => {
    lazySusanRef.current.rotation.y = MathUtils.lerp(
      lazySusanRef.current.rotation.y,
      targetRotation,
      0.1
    )
  })

  function keepRotationInBounds(rotation: number) {
    let newRotation = rotation;
    while (newRotation < 0) {
      newRotation += 2 * Math.PI;
    }
    while (newRotation >= 2 * Math.PI) {
      newRotation -= 2 * Math.PI;
    }
    return newRotation;
  }
  useEffect(() => {
    const handleKeyDown = (e: any) => {
      console.log('key down: ' + e.code);
      if (e.code === 'ArrowLeft') {
        setTargetRotation((targetRotation) => keepRotationInBounds(targetRotation - 2 * Math.PI / 3.0))
        if (selectedIndex === 0) {
          setSelectedIndex(ships.length - 1);
          props.setSelectedShip(ships[ships.length - 1]);
        } else {
          setSelectedIndex(selectedIndex - 1)
          props.setSelectedShip(ships[selectedIndex - 1]);
        }
      } else if (e.code === 'ArrowRight') {
        setTargetRotation((targetRotation) =>keepRotationInBounds(targetRotation + 2 * Math.PI/3.0))
        setSelectedIndex((selectedIndex + 1) % ships.length)
        props.setSelectedShip(ships[(selectedIndex + 1) % ships.length]);
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
  
  const [ selectedShip, setSelectedShip ] = React.useState<any>("Gemini");

  return (
    <>
      <div style={{
        position: "absolute",
        left: window.innerWidth / 2,
        top: window.innerHeight / 2,
        fontFamily: 'Press Start 2P',
        fontSize: 40
      }}>
        {selectedShip}
      </div>
      <div style={{
        width: "100vw",
        height: "100vh"
      }}>
        <Canvas camera={{fov: 100}} style={{width: "100%", height: "100%"}} color={"black"}>
          <axesHelper />
          <OrbitControls />
          <ShipLazySusan setSelectedShip={setSelectedShip} />
          <Stage preset={"rembrandt"} adjustCamera={true}>
            
          </Stage>
        </Canvas>
      </div>
    </>
  );
}

export default App;
