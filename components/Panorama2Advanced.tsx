import React, { useEffect, useRef } from 'react';
import { View } from 'react-native';
import { GLView } from 'expo-gl';
import { Renderer, TextureLoader } from 'expo-three';
import * as THREE from 'three';
import { Asset } from 'expo-asset';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { HorizontalBlurShader } from 'three/examples/jsm/shaders/HorizontalBlurShader';
import { VerticalBlurShader } from 'three/examples/jsm/shaders/VerticalBlurShader';

const MinecraftPanorama = () => {
  const glViewRef = useRef<any>();
  const animationFrameId = useRef<number>();

  // CUBE
  const CUBE_SIZE = 5 * 12; // 5*3 is a good starting point

  // CAMERA
  const CAMERA_DISTANCE = 5; // 5 is a good starting point
  const CAMERA_ZOOM = 2; // 2 is a good starting point
  const CAMERA_FOV = 120; // 75 is a good starting point
  const CAMERA_FOCAL_LENGTH = 15; // 20 is a good starting point = HIGHER MORE ZOOM

  // BLUR
  const CAMERA_BLUR = 300; // 400 is a good starting point = LESSER MORE BLUR
  const TEXTURE_BLUR = 0.0015; // 0.005 is a good starting point = LESSER LESSER BLUR

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

      float blurSize = ${TEXTURE_BLUR}; // Adjust this value for more/less blur

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

  function toRadians(degrees: number) {
    return degrees * (Math.PI / 180);
  }

  const handleContextCreate = async (gl: any) => {
    let renderer: Renderer;
    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let cube: THREE.Mesh;
    let composer: EffectComposer;

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

        // Apply filters to smooth seams
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;

        return texture;
      });

      return textures;
    };

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
        CAMERA_FOV,  // Wide-angle field of view
        gl.drawingBufferWidth / gl.drawingBufferHeight,
        0.1,
        1000
      );

      // Apply camera settings
      camera.zoom = CAMERA_ZOOM;
      camera.setFocalLength(CAMERA_FOCAL_LENGTH);
      camera.updateProjectionMatrix(); // Update the camera projection matrix after changes

      camera.position.z = CAMERA_DISTANCE; // Position the camera

      console.log("Camera set up with FOV, focal length, and focus applied", camera);

      // Load panorama textures
      try {
        const textures = await loadPanoramaTextures();

        var materials;
        // Create the materials dynamically based on the textures array
        if (TEXTURE_BLUR != null) {
          materials = textures.map(
            (texture) =>
              new THREE.ShaderMaterial({
                uniforms: {
                  texture: { value: texture },
                },
                vertexShader,
                fragmentShader,
                side: THREE.BackSide
              })
          );
        } else {
          materials = textures.map(
            (texture) => new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide })
          );
        }

        // Create the cube geometry and apply the materials
        const geometry = new THREE.BoxGeometry(CUBE_SIZE, CUBE_SIZE, CUBE_SIZE);
        cube = new THREE.Mesh(geometry, materials);
        scene.add(cube);

        console.log("Cube with panorama textures added to the scene");
      } catch (error) {
        console.error("Error during cube creation or texture loading", error);
      }

      // Set up the composer for post-processing
      composer = new EffectComposer(renderer);

      // Add the render pass (this renders the scene)
      const renderPass = new RenderPass(scene, camera);
      composer.addPass(renderPass);


      if (CAMERA_BLUR != null) {
        // Add a horizontal blur pass
        const hBlur = new ShaderPass(HorizontalBlurShader);
        hBlur.uniforms['h'].value = 1.0 / CAMERA_BLUR; // Adjust the horizontal blur strength
        composer.addPass(hBlur);

        // Add a vertical blur pass
        const vBlur = new ShaderPass(VerticalBlurShader);
        vBlur.uniforms['v'].value = 1.0 / CAMERA_BLUR; // Adjust the vertical blur strength
        composer.addPass(vBlur);
      }

      // Start the animation loop
      let previousTime = 0;
      const animate = (time: number) => {
        animationFrameId.current = requestAnimationFrame(animate);

        const t = (time - previousTime) / 1000;
        // previousTime = time;

        // if (cube) {
        //   cube.rotation.y += 0.001 * deltaTime;
        // }

        // Rotate the cube
        if (cube) {
          // cube.rotation.y += 0.001;
          // cube.rotation.y += 0.01;
          { // SIDES
            var minAngle = toRadians(-180);
            var maxAngle = toRadians(180);

            var capeV = minAngle + (Math.sin(t * 0.025) + 1) / 2 * (maxAngle - minAngle);
            camera.rotation.y = capeV;
          }
          {// UP AND DOWN
            var minAngle = toRadians(-8);
            var maxAngle = toRadians(8);

            var capeV = minAngle + (Math.sin(t * 0.1) + 1) / 2 * (maxAngle - minAngle);
            camera.rotation.x = capeV;
          }
        }

        // Render the scene with the blur effect
        composer.render();
        gl.endFrameEXP();
      };

      animate(0);
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

export default MinecraftPanorama;
