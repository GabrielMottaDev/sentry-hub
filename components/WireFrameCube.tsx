import React, { useEffect, useRef } from 'react';
import { View } from 'react-native';
import { GLView } from 'expo-gl';
import { Renderer } from 'expo-three';
import * as THREE from 'three';
import { Asset } from 'expo-asset';

const WireFrameCube = () => {
  const glViewRef = useRef<any>();
  const animationFrameId = useRef<number>();

  const handleContextCreate = async (gl: any) => {
    let renderer: Renderer;
    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let cube: THREE.Mesh;

    // Ensure WebGL context is initialized
    console.log("WebGL context initialized");

    const init = async (gl: any) => {
      // Set up the WebGL renderer
      renderer = new Renderer({ gl });
      renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);
      renderer.setClearColor(0x000000, 1);
      
      console.log("Renderer and scene set up");

      // Create the scene
      scene = new THREE.Scene();

      // Set up the camera
      camera = new THREE.PerspectiveCamera(
        75,
        gl.drawingBufferWidth / gl.drawingBufferHeight,
        0.1,
        1000
      );
      camera.position.z = 5;  // Adjust the camera position to ensure the cube is visible
      console.log("Camera set up with position", camera.position);

      // Temporary colored cube (no textures)
      const geometry = new THREE.BoxGeometry(2, 2, 2);
      const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });  // Simple green wireframe cube
      cube = new THREE.Mesh(geometry, material);
      scene.add(cube);
      
      console.log("Colored cube added to the scene");

      // Start the animation loop
      const animate = () => {
        animationFrameId.current = requestAnimationFrame(animate);

        // Rotate the cube for animation
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;

        // Render the scene
        renderer.render(scene, camera);
        gl.endFrameEXP();  // End the frame
      };

      animate();  // Start the animation
    };

    await init(gl);
  };

  useEffect(() => {
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  return (
    <View
      style={{ flex: 0, width: 300, height: 300, backgroundColor: 'red' }}
    >
      <GLView
        style={{ flex: 1, width: 300, height: 300 }}
        onContextCreate={handleContextCreate}
        ref={glViewRef}
      />
    </View>
  );
};

export default WireFrameCube;
