import React, { useEffect, useRef } from 'react';
import { PixelRatio, View } from 'react-native';
import { ExpoWebGLRenderingContext, GLView } from 'expo-gl';
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

    const init = async (gl: ExpoWebGLRenderingContext) => {
      try {
        const pixelStorei = gl.pixelStorei.bind(gl);
        gl.pixelStorei = (...args) => {
          const [parameter] = args;
          switch (parameter) {
            case gl.UNPACK_FLIP_Y_WEBGL:
              return pixelStorei(...args);
          }
        }
      } catch (e) {

      }

      // Set up the WebGL renderer
      renderer = new Renderer({ gl });
      // renderer.setPixelRatio( PixelRatio.get() );
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);
      renderer.setClearColor(0x000000, 1);
      var asdd: ExpoWebGLRenderingContext;

      console.log("Renderer and scene set up");

      // Create the scene
      scene = new THREE.Scene();

      // Set up the camera
      camera = new THREE.PerspectiveCamera(
        90,  // Wide-angle field of view
        gl.drawingBufferWidth / gl.drawingBufferHeight,
        0.1,
        100
      );
      // camera.aspect = gl.drawingBufferWidth / gl.drawingBufferHeight;
      camera.position.z = 0.01;
      camera.updateProjectionMatrix(); // Update the camera projection matrix after changes

      console.log("Camera set up with FOV, focal length, and focus applied", camera);

      // Load panorama textures
      try {
        const textures = await loadPanoramaTextures();

        var materials = textures.map(
          (texture) => new THREE.MeshBasicMaterial({ map: texture, side: THREE.FrontSide })
        );


        // Create the cube geometry and apply the materials
        // const geometry = new THREE.BoxGeometry(CUBE_SIZE, CUBE_SIZE, CUBE_SIZE);
        // cube = new THREE.Mesh(geometry, materials);
        // scene.add(cube);
        const skyBox = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), materials);
        skyBox.geometry.scale(1, 1, - 1);
        scene.add(skyBox);

        console.log("Cube with panorama textures added to the scene");
      } catch (error) {
        console.error("Error during cube creation or texture loading", error);
      }

      // Set up the composer for post-processing
      composer = new EffectComposer(renderer);

      // Add the render pass (this renders the scene)
      const renderPass = new RenderPass(scene, camera);
      composer.addPass(renderPass);

      // Start the animation loop
      let previousTime = 0;
      const animate = (time: DOMHighResTimeStamp, frame: XRFrame) => {
        // animationFrameId.current = requestAnimationFrame(animate);

        const t = (time - previousTime) / 1000;
        // previousTime = time;

        // if (cube) {
        //   cube.rotation.y += 0.001 * deltaTime;
        // }

        // Rotate the cube
        if (camera) {
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
      renderer.setAnimationLoop(animate);

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
