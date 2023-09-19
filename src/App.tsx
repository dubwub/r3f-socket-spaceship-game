import React, { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame, ThreeElements, extend, Object3DNode, useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls, Stage, Text } from '@react-three/drei';
import './index.css';

import { Color, MathUtils } from 'three'

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

function PlayerShip(props: any) {
  const acceleration = 10;
  const topSpeed = 100;

  const [ pressedKeys, setPressedKeys ] = React.useState(new Set()); 
  const [ velocities, setVelocities ] = React.useState({ vx: 0, vy: 0 })

  const meshRef = useRef<any>();

  let models = {
    gemini: useLoader(GLTFLoader, "gemini/scene.gltf"),
    virgo: useLoader(GLTFLoader, "virgo/scene.gltf"),
    scorpio: useLoader(GLTFLoader, "scorpio/scene.gltf")
  }
  
  let mesh = <></>;
  if (props.model === "Gemini") {
    mesh = <primitive ref={meshRef} object={models.gemini.scene} scale={0.06} position={[0, 0, 0]}/>
  } else if (props.model === "Virgo") {
    mesh = <primitive ref={meshRef} object={models.virgo.scene} scale={0.03} position={[0, 0, 0]}/>
  } else { // ... if (props.model === "Scorpio")
    mesh = <primitive ref={meshRef} object={models.scorpio.scene} scale={0.2} position={[0, 0, 0]}/>
  }

  useFrame((state, delta) => {
    setVelocities(({vx, vy}) => {
      // modify with keys
      let keys = [ "KeyW", "KeyA", "KeyS", "KeyD" ];
      let modifiers = [ [0, 1], [-1, 0], [0, -1], [1, 0] ]
      let new_vx = vx;
      let new_vy = vy;

      for (let i = 0; i < keys.length; i++) {
        if (pressedKeys.has(keys[i])) {
          new_vx = new_vx + modifiers[i][0] * acceleration * delta;
          new_vy = new_vy + modifiers[i][1] * acceleration * delta; 
        }
      }
      
      // friction
      if (!pressedKeys.has("KeyA") && !pressedKeys.has("KeyD")) {
        new_vx *= .9;
      }
      if (!pressedKeys.has("KeyW") && !pressedKeys.has("KeyS")) {
        new_vy *= .9;
      }
      
      // check velocity caps
      if (new_vx < -1 * topSpeed) { new_vx = -1 * topSpeed }
      if (new_vx > topSpeed) { new_vx = topSpeed }
      if (new_vy < -1 * topSpeed) { new_vy = -1 * topSpeed }
      if (new_vy > topSpeed) { new_vy = topSpeed }

      // modify position
      meshRef.current.position.x += new_vx * delta;
      meshRef.current.position.y += new_vy * delta;

      // check position caps
      let boxBound = 50;
      if (meshRef.current.position.x < -1 * boxBound) { new_vx = -1 * boxBound }
      if (meshRef.current.position.x > boxBound) { new_vx = boxBound }
      if (meshRef.current.position.y < -1 * boxBound) { new_vy = -1 * boxBound }
      if (meshRef.current.position.y > boxBound) { new_vy = boxBound }

      return {
        vx: new_vx,
        vy: new_vy,
      }
    })
  })  

  useEffect(() => {
    const handleKeyDown = (e: any) => {
      console.log('key down: ' + e.code);
      if (["KeyW", "KeyA", "KeyS", "KeyD"].indexOf(e.code) !== -1) {
        let newSet = new Set(pressedKeys);
        newSet.add(e.code);
        setPressedKeys((_) => newSet);
      }
    }
    const handleKeyUp = (e: any) => {
      console.log('key up: ' + e.code);
      if (["KeyW", "KeyA", "KeyS", "KeyD"].indexOf(e.code) !== -1) {
        let newSet = new Set(pressedKeys);
        newSet.delete(e.code);
        setPressedKeys((_) => newSet);
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('keyup', handleKeyUp)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  return (
    <>{ mesh }</>
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
          <PlayerShip model={selectedShip} />
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
