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

function Particle(props: any) {
  let color = new Color(props.color);
  const [vy, setVy] = React.useState(props.vy);
  const particleRef = React.useRef<any>();

  useFrame((state, delta) => {
    particleRef.current.position.x += delta * props.vx;
    particleRef.current.position.y += delta * vy;

    if (particleRef.current.position.y < 10) {
      props.setActive(false);
    }
    particleRef.current.position.z += delta * props.vx;
    particleRef.current.rotation.x += delta * props.vx;

    setVy(vy - delta * 5); // gravity
  });

  return (
    <mesh position={[props.x, props.y, 0]} ref={particleRef}>
      <boxGeometry args={[props.radius, props.radius, props.radius]} />
      <meshStandardMaterial
        emissiveIntensity={0.5}
        emissive={color}
        color={color}
      />
    </mesh>
  );
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
  console.log('si-global', selectedIndex);


  const [ particleExperiment, setParticleExperiment ] = React.useState([]);

  useFrame((state, delta) => {
    lazySusanRef.current.rotation.y = MathUtils.lerp(
      lazySusanRef.current.rotation.y,
      targetRotation,
      0.1
    )
  })

  useEffect(() => {
    const handleKeyDown = (e: any) => {
      console.log('key down: ' + e.code);
      if (e.code === 'ArrowLeft') {
        setTargetRotation((targetRotation) => targetRotation - 2 * Math.PI / 3.0)
        setSelectedIndex((selectedIndex) => {
          let newIndex;
          if (selectedIndex === 0) {
            newIndex = ships.length - 1;
          } else {
            newIndex = selectedIndex - 1;
          }
          props.setSelectedShip(ships[newIndex]);
          return newIndex;
        })
      } else if (e.code === 'ArrowRight') {
        setTargetRotation((targetRotation) => targetRotation + 2 * Math.PI/3.0)
        setSelectedIndex((selectedIndex) => {
          let newIndex = (selectedIndex + 1) % ships.length;
          props.setSelectedShip(ships[newIndex]);
          return newIndex;
        })
      } else if (e.code === 'Space') {
        console.log('here we are');
        props.setIsLoading(false);
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
  const [ isLoading, setIsLoading ] = React.useState(true);

  let view;
  if (isLoading) {
    view = (
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
        <Canvas camera={{fov: 100, position: [0,10,20]}} style={{width: "100%", height: "100%"}} color={"black"}>
          <axesHelper />
          <ShipLazySusan setSelectedShip={setSelectedShip} setIsLoading={setIsLoading} />
        </Canvas>
      </>
    )
  } else {
    view = (
      <>
        <Canvas>
          <axesHelper />
        </Canvas>
      </>
    );
  }

  return (
    <>
      <div style={{
        width: "100vw",
        height: "100vh"
      }}>
        { view }
      </div>
    </>
  );
}

export default App;
