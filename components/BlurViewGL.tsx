import React, { useEffect } from 'react';
import { ExpoWebGLRenderingContext, GLView } from 'expo-gl';
import { StyleSheet, Dimensions } from 'react-native';
import { TextureLoader, Renderer } from 'expo-three'; // Import Renderer from expo-three
import * as THREE from 'three';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const BlurViewGL = ({ blurRadius = 5 }) => {
  const onContextCreate = async (gl: ExpoWebGLRenderingContext) => {
    const renderer = new Renderer({ gl });
    renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(
      SCREEN_WIDTH / -2, SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2, SCREEN_HEIGHT / -2, 0.1, 10
    );
    camera.position.z = 1;

    // Plane geometry to apply blur shader to
    const geometry = new THREE.PlaneGeometry(SCREEN_WIDTH, SCREEN_HEIGHT);
    
    // Blur shader material
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTexture: { value: new TextureLoader().load(require('')/* Provide your background texture or view here */) },
        resolution: { value: new THREE.Vector2(SCREEN_WIDTH, SCREEN_HEIGHT) },
        blurRadius: { value: blurRadius }
      },
      vertexShader: `
        varying vec2 uv;
        void main() {
          uv = position.xy * 0.5 + 0.5;
          gl_Position = vec4(position.xy, 0.0, 1.0);
        }
      `,
      fragmentShader: `
        precision highp float;
        uniform sampler2D uTexture;
        uniform vec2 resolution;
        uniform float blurRadius;

        vec4 blur(vec2 uv) {
          vec4 color = vec4(0.0);
          float total = 0.0;

          for (float x = -4.0; x <= 4.0; x++) {
            for (float y = -4.0; y <= 4.0; y++) {
              vec2 offset = vec2(x, y) * blurRadius / resolution;
              color += texture2D(uTexture, uv + offset);
              total += 1.0;
            }
          }

          return color / total;
        }

        void main() {
          vec2 uv = gl_FragCoord.xy / resolution.xy;
          gl_FragColor = blur(uv);
        }
      `,
    });

    // Create the mesh with the plane and material
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Render loop
    const render = () => {
      renderer.render(scene, camera);
      gl.endFrameEXP();
    };

    const animate = () => {
      requestAnimationFrame(animate);
      render();
    };

    // Start the animation loop
    animate();
  };

  return (
    <GLView
      style={styles.glView}
      onContextCreate={onContextCreate}
    />
  );
};

const styles = StyleSheet.create({
  glView: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    position: 'absolute',
    top: 0,
    left: 0,
  },
});

export default BlurViewGL;
