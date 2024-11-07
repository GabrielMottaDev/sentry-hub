import React, { MutableRefObject, RefObject, useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Text, PixelRatio, Pressable } from 'react-native';
import WebView from 'react-native-webview';
import { AndroidWebViewProps, IOSWebViewProps, WindowsWebViewProps } from 'react-native-webview/lib/WebViewTypes';

export type BustSideProps = {
    debug?: boolean,
    // uuid: string,
    // textureB64: string,
    skinImage: string, // base64 image
    capeImage: string, // base64 image
    onPress?: ({}: BustSideFunctions) => void
}

export type AnimationType = 'flip' | 'idle' | 'walking' | 'running' | 'sneaking' | 'jumping' | 'flying' | 'swimming' | 'head_wondering';

export type BustSideFunctions = {
    toggleAnimation: (animation: AnimationType, toggle?: boolean) => void
}

const HTML_WIDTH_PX = 400;
const HTML_HEIGHT_PX = 400; // 900

// https://docs.expo.dev/versions/latest/sdk/webview/
const BustSide = React.forwardRef((props: BustSideProps, ref) => {

    const { skinImage, capeImage, onPress, debug } = props;

    // const textures = JSON.parse(atob(textureB64));
    // var textureLink = textures.textures.SKIN.url;
    // var capeLink = textures.textures.CAPE.url;

    // LOG  http://textures.minecraft.net/texture/fa82d90f65b41e9729cbdf7686c51c3f51146d09495efa412f9581d681582985
    // LOG  http://textures.minecraft.net/texture/153b1a0dfcbae953cdeb6f2c2bf6bf79943239b1372780da44bcbb29273131da

    // textureLink = textureLink.replace("http://", "https://");
    // capeLink = capeLink.replace("http://", "https://");

    // console.log(textureB64);
    // console.log(textureLink);
    // console.log(capeLink);

    const HTML = React.useMemo(() => `
        <html>
            <head>
                <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.min.js" integrity="sha256-FgpCb/KJQlLNfOu91ta32o/NMZxltwRo8QtmkMRdAu8=" crossorigin="anonymous"></script>
                <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/94/three.min.js" integrity="sha256-NGC9JEuTWN4GhTj091wctgjzftr+8WNDmw0H8J5YPYE=" crossorigin="anonymous"></script>
                <script src="https://cdn.jsdelivr.net/gh/InventivetalentDev/MineRender@1.4.6/dist/skin.min.js"></script>
                <style>
                    * {
                        margin: 0;
                        padding: 0;
                    }
                    mySkinContainer {
                        width: 100%;
                        height: 100%;
                    }
                    canvas {
                        width: 100%;
                        height: 100%;

                        /* Drop Shadow */
                        -webkit-filter: drop-shadow(5px 5px 5px #222);
                        filter: drop-shadow(5px 5px 5px #222);
                    }
                </style>   
            </head>
            <body style="${debug ? "background: green" : "background: transparent"}; margin: 0">
                <div id="mySkinContainer" style="${debug ? "background: red" : "background: transparent"}"></div>
            </body>
        </html>`, [debug]);

    const JSCODE = React.useMemo(() => {
        return `
        // Debug
        const consoleLog = (type, log) => window.ReactNativeWebView.postMessage(JSON.stringify({'type': 'console', 'data': {'type': type, 'log': log}}));
        console = {
            log: (log) => consoleLog('log', log),
            debug: (log) => consoleLog('debug', log),
            info: (log) => consoleLog('info', log),
            warn: (log) => consoleLog('warn', log),
            error: (log) => consoleLog('error', log),
        };

        function toRadians(degrees) {
            return degrees * (Math.PI / 180);
        }

        var skinContainer = document.getElementById("mySkinContainer");
        var blockD = 14;
        var mainCamera = {
            type: "perspective", // orthographic
            x: -15,
            y: 1.8*blockD, // 25
            z: ${debug ? "-20" : "20"},
            target: {
                x: 0,
                y: 1.9*blockD,
                z: 0
            },
            zoom: 1.3
        }
        
        var configCamera = {
            type: mainCamera.type, // orthographic
            x: mainCamera.x,
            y: mainCamera.y,
            z: mainCamera.z,
            target: [mainCamera.target.x, mainCamera.target.y, mainCamera.target.z],
            zoom: mainCamera.zoom
        };

        var skinRender = new SkinRender({
            autoResize: false,
            canvas: {
                width: ${HTML_WIDTH_PX/PixelRatio.get()},
                height: ${HTML_HEIGHT_PX/PixelRatio.get()}
            },
            render: {
                taa: true // temporal anti-aliasing
            },
            controls: {
                enabled: false,
                pan: false,
                rotate: false,
                zoom: false
            },
            camera: {
                ...configCamera
            },
            pauseHidden: true, // Pause invisible animations
            shadow: true,
            showAxes: ${debug ? "true" : "false"},
            showOutlines: ${debug ? "true" : "false"},
            showGrid: ${debug ? "true" : "false"},
            makeNonTransparentOpaque: false,
            sendStats: false,
            frameRateLimit: 30
        }, skinContainer);

        function getCamera(){
            let camera = skinRender._camera;
            return {
                x: camera.position.x,
                y: camera.position.y,
                z: camera.position.z,
                target: camera.target,
                zoom: camera.zoom
            };
        }

        function updateCamera(camera){
            skinRender._camera.position.x = camera.x;
            skinRender._camera.position.y = camera.y;
            skinRender._camera.position.z = camera.z;
            if(!skinRender._camera.target){
                skinRender._camera.target = camera.target;
            } else {
                skinRender._camera.target.x = camera.target.x;
                skinRender._camera.target.y = camera.target.y;
                skinRender._camera.target.z = camera.target.z;
            }
            if(camera.zoom){
                skinRender._camera.zoom = camera.zoom;
            }
            skinRender._camera.lookAt(new THREE.Vector3(skinRender._camera.target.x, skinRender._camera.target.y, skinRender._camera.target.z));
        }

        // skinRender.render({
        //     // uuid: "",
        //     // username: "Gabriel_Attom",
        //     // cape: "minecraft"
        // });
        console.log("RENDER");
        skinRender.render({
            data: "data:image/png;base64,${skinImage}",
            capeData: "data:image/png;base64,${capeImage}"
        }, () => {
            updateCamera(mainCamera);
        });
        
        document.config = {
            animate: true,
            animations: {
                flip: false, // FLIP CAMERA
                idle: true,
                walking: true,
                running: false, // TODO
                sneaking: false, // TODO
                jumping: false, // TODO
                flying: false, // TODO
                swimming: false, // TODO
                head_wondering: true
            },
        };

        function getConfig() {
            return document.config;
        }

        function updateConfig(config) {
            document.config = {
                ...config
            };
        }

        function toggleAnimation(animation, toggle){
            console.log("TOGGLE ANIMATION: " + animation + toggle);
            if(toggle==undefined){
                toggle = !document.config.animations[animation];
            }
            
            let currentConfig = getConfig();
            updateConfig({
                ...currentConfig,
                animations: {
                    ...currentConfig.animations,
                    [animation]: toggle
                }
            });
        }
        document.toggleAnimation = toggleAnimation;

        function isAnimating(animation){
            return document.config.animations[animation]|false;
        }

        var frameRate = 60; // Set a lower frame rate to reduce load
        var interval = 1000 / frameRate;
        var lastTime = 0;

        var startTime = Date.now();

        var lastAgeInTicks = 0;

        skinContainer.addEventListener("skinRender", function (e) {
            if (!document.config.animate) {
                return;
            }
            var now = Date.now();
            
            if (now - lastTime < interval) {
                return;
            }
            lastTime = now;

            var t = (now - startTime) / 1000;
            var deltaTime = t;

            var tickRate = 20; // 20 ticks per second
            var ticksPerSecond = tickRate * deltaTime; // Scaled deltaTime in ticks
            
            var ageInTicks = Math.floor(t * 20);
            if(lastAgeInTicks==0){
                lastAgeInTicks = ageInTicks;
            }
            
            // let currentCamera = getCamera();

            // IDLE ANIMATION
            // ARMS SIDE TO SIDE
            if(isAnimating("idle")){
                // Additional side-to-side sway for more realistic movement
                e.detail.playerModel.children[3].rotation.z = 0;
                e.detail.playerModel.children[2].rotation.z = 0;
                e.detail.playerModel.children[3].rotation.z += Math.cos(ageInTicks * 0.09) * 0.05 + 0.05;
                e.detail.playerModel.children[2].rotation.z -= Math.cos(ageInTicks * 0.09) * 0.05 + 0.05;
            }

            // WALKING ANIMATION
            // ARMS AND LEGS
            if(isAnimating("walking")){
                var minAngle = toRadians(-45);
                var maxAngle = toRadians(45);
                // Animate the cape within the angle range smoothly using sine
                var armLegV = minAngle + (Math.sin(t * 10) + 1) / 2 * (maxAngle - minAngle);
                // ARMS
                e.detail.playerModel.children[2].rotation.x = armLegV;
                e.detail.playerModel.children[3].rotation.x = -armLegV;
                // LEGS
                e.detail.playerModel.children[4].rotation.x = -armLegV;
                e.detail.playerModel.children[5].rotation.x = armLegV;
                // Smooth out the movement using sine-based smoothing
                e.detail.playerModel.children[3].rotation.x += Math.sin(ageInTicks * 0.067) * 0.05;
                e.detail.playerModel.children[2].rotation.x -= Math.sin(ageInTicks * 0.067) * 0.05;
                e.detail.playerModel.children[4].rotation.x += Math.sin(ageInTicks * 0.067) * 0.05;
                e.detail.playerModel.children[5].rotation.x -= Math.sin(ageInTicks * 0.067) * 0.05;
            }
            // CAPE
            if(isAnimating("walking")){
                var minAngle = toRadians(25);
                var maxAngle = toRadians(30);
                // Animate the cape within the angle range smoothly using sine
                var capeV = minAngle + (Math.sin(t * 12) + 1) / 2 * (maxAngle - minAngle);
                // Set the rotation of the player's cape (child at index 6) smoothly
                if(e.detail.playerModel.children[6]){
                    e.detail.playerModel.children[6].rotation.x = capeV;
                }
            }
            
            // EXTRA ANIMATION
            // e.detail.playerModel.rotation.y += 0.01;
            var bodyV = Math.sin(t * 0.8) / 10;
            // BODY
            e.detail.playerModel.rotation.y = bodyV + (isAnimating("flip")?Math.PI:0);

            // HEAD
            if (isAnimating("head_wondering")) {
                e.detail.playerModel.children[0].rotation.x = Math.sin(t * 0.5) / 8; // UP DOWN
                e.detail.playerModel.children[0].rotation.y = Math.sin(t * 0.7) / 5;
            }

            // FINISH
            lastAgeInTicks = ageInTicks;
        });
        // OLD DEFAULT MOVEMENT
        // var armLegV = Math.sin(t * 10) / 2;
        // // ARMS
        // e.detail.playerModel.children[2].rotation.x = armLegV;
        // e.detail.playerModel.children[3].rotation.x = -armLegV;
        // // LEGS
        // e.detail.playerModel.children[4].rotation.x = -armLegV;
        // e.detail.playerModel.children[5].rotation.x = armLegV;
            // FLIP
            // e.detail.playerModel.rotation.y = toRadians(45);
            // updateCamera({
            //     ...currentCamera,
            //     x: 45,
            //     y: 2*blockD,
            //     z: 0,
            //     zoom: 2,
            //     target: {
            //         ...currentCamera.target,
            //         y: (2*blockD)-(blockD/2)
            //     }
            // });

            // INTERESSING, MAYBE HAND CAMERA MOVEMENT?
            // let blurIntensity = 0.05;
            // const animate = () => {
            //     requestAnimationFrame(animate);
            // var capeV = minAngle + (Math.sin(t * 0.03) + 1) / 2 * (maxAngle - minAngle);
                // panoramaCube.rotation.y = capeV;
            //     const blurOffset = Math.sin(Date.now() * 0.001) * blurIntensity;
            //     camera.position.x += blurOffset;
            //     camera.position.y += blurOffset;
        console.log("SkinRender: ", skinRender);

        `;
    }, [skinImage, capeImage, debug]);

    // Expose the child function to parent via ref
    const exposedFunctions: BustSideFunctions = {
        toggleAnimation(animation, toggle) {
            injectCodeIntoWebView(`
                document.toggleAnimation("${animation}"${toggle !== undefined ? `, ${toggle}` : ''});
            `);
        }
    }
    React.useImperativeHandle(ref, () => ({...exposedFunctions}));

    const webViewRef = useRef<WebView>(null!);
    const injectCodeIntoWebView = (code: string) => {
        // webViewRef.current.injectJavaScript('window.alert("Hello, from React Native!");');
        webViewRef.current.injectJavaScript(code);
    }

    const handlePress = React.useCallback(() => {
        onPress?.(exposedFunctions);
    }, [onPress, exposedFunctions]);

    // Refresh the webview for live view during development
    useEffect(() => {
        webViewRef.current.reload();
    }, []);

    return (
        <Pressable onPress={handlePress} style={[styles.pressable, {}]}>
            <View style={[styles.container, {}]}>
                <WebView
                    ref={webViewRef}
                    style={styles.webView}
                    originWhitelist={['*']}
                    cacheEnabled={true}
                    cacheMode={'LOAD_CACHE_ELSE_NETWORK'}
                    androidLayerType='hardware' // hw acceleration 
                    source={{
                        html: HTML
                    }}
                    scalesPageToFit={false} // Setting true completly destroys FPS LOL
                    // useWebView2={true}
                    startInLoadingState={true}
                    renderLoading={() => <></>} 
                    // startInLoadingState={true} renderLoading={() => <Text>Loading...</Text>} // For some reason, this makes the webview resizes subtracting the loading area
                    incognito={false}
                    allowsFullscreenVideo={false}   
                    allowsBackForwardNavigationGestures={false}
                    allowsLinkPreview={false}
                    allowsInlineMediaPlayback={true}
                    mediaPlaybackRequiresUserAction={false}
                    javaScriptEnabled={true}
                    injectedJavaScript={JSCODE}
                    scrollEnabled={false}
                    nestedScrollEnabled={false}
                    // onShouldStartLoadWithRequest={} // Intercept request
                    onMessage={(payload) => {
                        let dataPayload;
                        try {
                            dataPayload = JSON.parse(payload.nativeEvent.data);
                        } catch (e) { }

                        if (dataPayload) {
                            if (dataPayload.type === 'console') {
                                console.info(`[Console] ${JSON.stringify(dataPayload.data)}`);
                            } else {
                                console.log(dataPayload)
                            }
                        }
                    }}
                // injectedJavaScriptBeforeContentLoaded={JSCODE}
                />
            </View>
        </Pressable>
    );
});

const styles = StyleSheet.create({
    main: {
        flex: 0
    },
    pressable: {
        flex: 0,
        width: HTML_WIDTH_PX / PixelRatio.get(),
        height: HTML_HEIGHT_PX / PixelRatio.get(),
        // backgroundColor: 'red'
        backgroundColor: 'transparent'
    },
    container: {
        flex: 0,
        width: HTML_WIDTH_PX / PixelRatio.get(),
        height: HTML_HEIGHT_PX / PixelRatio.get(),
        pointerEvents: 'none',
        // backgroundColor: 'green'
        backgroundColor: 'transparent'
    },
    webView: {
        flex: 1,
        backgroundColor: 'transparent',
        // backgroundColor: 'yellow',
        pointerEvents: 'none',
        width: HTML_WIDTH_PX / PixelRatio.get(),
        height: HTML_HEIGHT_PX / PixelRatio.get(),
        // overflow: 'hidden',


        // scroll-margin: 0,
        // scroll-padding: 0,
        // pointerEvents: 'none'
        // width: (500*10/PixelRatio.getPixelSizeForLayoutSize(10))
        // width: PixelRatio.roundToNearestPixel(500)
    },
});

export default BustSide;