import React, { useEffect, useState } from 'react';
import { Dimensions, View, Text, StyleSheet, StyleProp } from 'react-native';
import { GLView } from 'expo-gl';
import { TextureLoader, Renderer } from 'expo-three'; // Import Renderer from expo-three
import { BoxGeometry, MeshBasicMaterial, Mesh, PerspectiveCamera, Scene, BackSide, FrontSide, LinearFilter, ClampToEdgeWrapping, Texture, ShaderMaterial, AmbientLight, AxesHelper } from 'three';
import { Asset } from 'expo-asset';
import { ExpoWebGLRenderingContext } from 'expo-gl'; // Import the correct context type
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

// Define the images for the cube (panorama)
const panoramaImages: any = {
    left: { rsrc: require('@/assets/images/panorama/panorama_0.png') }, // LEFT
    back: { rsrc: require('@/assets/images/panorama/panorama_1.png') }, // BACK
    right: { rsrc: require('@/assets/images/panorama/panorama_2.png') }, // RIGHT
    front: { rsrc: require('@/assets/images/panorama/panorama_3.png') }, // FRONT
    top: { rsrc: require('@/assets/images/panorama/panorama_4.png') }, // TOP
    bottom: { rsrc: require('@/assets/images/panorama/panorama_5.png') }, // BOTTOM
};

type PanoramaProps = {
    style?: StyleProp<any>;
};

// https://docs.expo.dev/versions/latest/sdk/gl-view/
// https://github.com/expo/expo-three
// https://docs.expo.dev/versions/latest/sdk/asset/
// https://github.com/expo/expo-three/issues/196
// https://github.com/expo/expo-three/issues/293
// https://github.com/expo/expo/issues/11063
const Panorama = ({ style }: PanoramaProps) => {
    const [isLoaded, setIsLoaded] = useState(false);

    // Step 1: Load images
    const loadImages = async () => {
        // const [{ localUri }] = await Asset.loadAsync(require('@/assets/images/panorama/panorama_0.png'));
        try {
            setIsLoaded(false);
            for(let panorama in panoramaImages) {
                const item = panoramaImages[panorama];
                // console.log(rsrc);
                const [{ localUri }] = await Asset.loadAsync(item.rsrc);
                item.uri = localUri;
            }
            setIsLoaded(true);
            console.log('Images loaded successfully');
        } catch (error) {
            console.error('Error loading images:', error);
        }
    };
    useEffect(() => {
        if(!isLoaded){
            loadImages();
        }
    }, []);

    function toRadians(degrees: number) {
        return degrees * (Math.PI / 180);
    }

    // Step 2: Render the scene using ExpoWebGLRenderingContext and three.js
    const renderScene = async (gl: ExpoWebGLRenderingContext) => {
        try {
            const pixelStorei = gl.pixelStorei.bind(gl);
            gl.pixelStorei = (...args) => {
                const [parameter] = args;
                switch (parameter) {
                    case gl.UNPACK_FLIP_Y_WEBGL:
                        return pixelStorei(...args);
                }
            }
            // Use Renderer from expo-three
            const renderer = new Renderer({ gl });

            renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);
            renderer.setClearColor(0x000000, 1); // Set background to black
            renderer.shadowMap.enabled = false;

            const scene = new Scene();

            const camera = new PerspectiveCamera(70, gl.drawingBufferWidth / gl.drawingBufferHeight, 0.1, 1000);
            camera.position.set(0, 0, 0); // Set camera inside the cube

            // Load textures and create materials for the panorama cube
            const loader = new TextureLoader();

            // Create the cube geometry and apply the materials (panorama cube)
            const cubeGeometry = new BoxGeometry(5, 5, 5); // 5x5x5 cube

            // Material for the inside (blue)
            const insideMaterial = new MeshBasicMaterial({
                color: 0x0000ff, // Blue color
                side: BackSide,  // Render the inside surfaces
            });

            // Material for the outside (red)
            const outsideMaterial = new MeshBasicMaterial({
                color: 0xff0000, // Red color
                side: FrontSide, // Render the outside surfaces
            });

            // Create two meshes, one for inside and one for outside
            const insideCube = new Mesh(cubeGeometry, insideMaterial);
            const outsideCube = new Mesh(cubeGeometry, outsideMaterial);

            // scene.add(insideCube);  // Add the inside cube to the scene
            // scene.add(outsideCube); // Add the outside cube to the scene

            const configureTexture = (texture: Texture): Texture => {
                texture.wrapS = ClampToEdgeWrapping;
                texture.wrapT = ClampToEdgeWrapping;
                texture.minFilter = LinearFilter; // Smooth textures when far away
                texture.magFilter = LinearFilter; // Smooth textures when close up
                texture.generateMipmaps = false; // Improve performance
                return texture;
            };

            const bottomTexture = loader.load(panoramaImages.bottom.uri);
            bottomTexture.center.set(0.5, 0.5);
            bottomTexture.rotation = toRadians(-90);

            const topTexture = loader.load(panoramaImages.top.uri);
            topTexture.center.set(0.5, 0.5);
            topTexture.rotation = toRadians(90);

            const panoramaMaterials = [
                new MeshBasicMaterial({
                    map: configureTexture(loader.load(panoramaImages.left.uri)),
                    side: BackSide,
                }), // LEFT
                new MeshBasicMaterial({
                    map: configureTexture(loader.load(panoramaImages.right.uri)),
                    side: BackSide,
                }), // RIGHT
                new MeshBasicMaterial({
                    map: configureTexture(topTexture),
                    side: BackSide,
                }), // TOP
                new MeshBasicMaterial({
                    map: configureTexture(bottomTexture),
                    side: BackSide,
                }), // BOTTOM
                new MeshBasicMaterial({
                    map: configureTexture(loader.load(panoramaImages.front.uri)),
                    side: BackSide,
                }), // FRONT
                new MeshBasicMaterial({
                    map: configureTexture(loader.load(panoramaImages.back.uri)),
                    side: BackSide,
                }), // BACK
            ];

            const cubeSize = 5.01 * 25;
            // Create the cube geometry and apply the materials (panorama cube)
            const panoramaGeometry = new BoxGeometry(cubeSize, cubeSize, cubeSize);  // 5x5x5 cube
            const panoramaCube = new Mesh(panoramaGeometry, panoramaMaterials);
            scene.add(panoramaCube);

            let previousTime = 0;
            // Animate the cubes (panorama and red cube)
            let blurIntensity = 0.05;

            const animate = (now: number) => {
                requestAnimationFrame(animate);

                // var now = Date.now();
                var t = (now - previousTime) / 1000;

                camera.fov = 120;
                camera.setFocalLength(8);
                camera.focus = 1;
                camera.updateProjectionMatrix();
                // const blurOffset = Math.sin(t * 1) * blurIntensity;
                // panoramaCube.rotation.x += blurOffset;
                // camera.position.x += blurOffset;
                // camera.position.y += blurOffset;



                // Rotate the panorama cube slowly
                // panoramaCube.rotation.y += toRadians(1);
                // panoramaCube.rotation.x = toRadians(0);

                camera.zoom = 2;
                { // lados
                    var minAngle = toRadians(-180);
                    var maxAngle = toRadians(180);

                    var capeV = minAngle + (Math.sin(t * 0.025) + 1) / 2 * (maxAngle - minAngle);
                    camera.rotation.y = capeV;
                }
                {// cima baixo
                    var minAngle = toRadians(-8);
                    var maxAngle = toRadians(8);

                    var capeV = minAngle + (Math.sin(t * 0.1) + 1) / 2 * (maxAngle - minAngle);
                    camera.rotation.x = capeV;
                }



                // panoramaCube.rotation.y += 0.001; // Slow rotation around the Y-axis
                // panoramaCube.rotation.x += 0.0005; // Slight rotation around the X-axis for realism

                // gl.enable(gl.CULL_FACE);
                // gl.frontFace(gl.CCW);

                // gl.enable( gl.DEPTH_TEST );
                // gl.enable(gl.CULL_FACE);
                // gl.frontFace(gl.CCW);
                // gl.frontFace(gl.CW);

                gl.cullFace(gl.BACK);
                // gl.cullFace(gl.FRONT);



                renderer.render(scene, camera);
                gl.endFrameEXP(); // Notify Expo that the frame is done
            };

            animate(0);
            console.log('Panorama animation started');
        } catch (error) {
            console.error('Error during rendering setup:', error);
        }
    };

    return (
        <View style={[{ flex: 1, backgroundColor: 'transparent', width: '100%', height: 500, }, style]}>
            {isLoaded ? (
                <View style={{ flex: 1, position: 'relative' }}>
                    <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, zIndex: 1 }}>
                        <BlurView tint='dark' intensity={90} style={styles.absolute} />
                        {/* <Text style={{fontSize: 12,color: 'red'}}>Teste</Text> */}
                    </View>
                    <GLView
                        style={{ flex: 1, backgroundColor: 'transparent' }}
                        onContextCreate={renderScene}
                    />
                </View>
            ) : (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text>Loading...</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: 300,
        height: 300,
    },
    absolute: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
    },
});

export default Panorama;
