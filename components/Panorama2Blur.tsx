import React, { useEffect, useRef } from 'react';
import { View } from 'react-native';
import { GLView } from 'expo-gl';
import { Renderer, TextureLoader } from 'expo-three';
import * as THREE from 'three';
import { Asset } from 'expo-asset';

const MinecraftPanorama = () => {
  const glViewRef = useRef<any>();
  const animationFrameId = useRef<number>();

  // Vertex shader for the cube (basic)
  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  // Fragment shader for Gaussian blur effect
  const fragmentShader = `
    uniform sampler2D texture;
    varying vec2 vUv;

    void main() {
      vec4 color = vec4(0.0);

      float blurSize = 0.005; // Adjust this value for more/less blur

      // Sample neighboring texels for blur
      for (int x = -4; x <= 4; x++) {
        for (int y = -4; y <= 4; y++) {
          vec2 offset = vec2(x, y) * blurSize;
          color += texture2D(texture, vUv + offset);
        }
      }

      color /= 81.0; // Normalizing the color sum
      gl_FragColor = color;
    }
  `;

  const handleContextCreate = async (gl: any) => {
    let renderer: Renderer;
    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let cube: THREE.Mesh;

    console.log("WebGL context initialized");

    // Load panorama textures using expo-three's TextureLoader
    const loadPanoramaTextures = async (): Promise<THREE.Texture[]> => {
      const images = await Promise.all([
        Asset.fromModule(require('@/assets/images/panorama/panorama_1.png')).downloadAsync(), // Right
        Asset.fromModule(require('@/assets/images/panorama/panorama_3.png')).downloadAsync(), // Left
        Asset.fromModule(require('@/assets/images/panorama/panorama_4.png')).downloadAsync(), // Top
        Asset.fromModule(require('@/assets/images/panorama/panorama_5.png')).downloadAsync(), // Bottom
        Asset.fromModule(require('@/assets/images/panorama/panorama_0.png')).downloadAsync(), // Front
        Asset.fromModule(require('@/assets/images/panorama/panorama_2.png')).downloadAsync(), // Back
      ]);

      // Use TextureLoader from expo-three
      const textureLoader = new TextureLoader();

      const textures = images.map((image) => {
        const texture = textureLoader.load(image.localUri || image.uri);
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        return texture;
      });

      return textures;
    };

    const init = async (gl: any) => {
      renderer = new Renderer({ gl });
      renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);
      renderer.setClearColor(0x000000, 1);

      console.log("Renderer and scene set up");

      scene = new THREE.Scene();

      camera = new THREE.PerspectiveCamera(
        75,
        gl.drawingBufferWidth / gl.drawingBufferHeight,
        0.1,
        1000
      );
      camera.position.z = 5;

      console.log("Camera set up with position", camera.position);

      // Load panorama textures
      try {
        const textures = await loadPanoramaTextures();

        const materials = textures.map(
          (texture) =>
            new THREE.ShaderMaterial({
              uniforms: {
                texture: { value: texture },
              },
              vertexShader,
              fragmentShader,
              side: THREE.BackSide,
            })
        );

        const geometry = new THREE.BoxGeometry(10, 10, 10);
        cube = new THREE.Mesh(geometry, materials);
        scene.add(cube);

        console.log("Cube with panorama textures added to the scene with blur shader");
      } catch (error) {
        console.error("Error during cube creation or texture loading", error);
      }

      const animate = () => {
        animationFrameId.current = requestAnimationFrame(animate);

        if (cube) {
          cube.rotation.y += 0.001;
        }

        renderer.render(scene, camera);
        gl.endFrameEXP();
      };

      animate();
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
    <View style={{ flex: 0, width: 300, height: 300, backgroundColor: 'red' }}>
      <GLView
        style={{ flex: 1, width: 300, height: 300 }}
        onContextCreate={handleContextCreate}
        ref={glViewRef}
      />
    </View>
  );
};

export default MinecraftPanorama;
