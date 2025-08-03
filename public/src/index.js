import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FlakesTexture } from 'three/examples/jsm/textures/FlakesTexture.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
// import hdri from './Studio.hdr';
// import glb from './Shivling3.glb';

import { GodRaysEffect, EffectComposer, EffectPass, RenderPass } from "postprocessing";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";

let scene, camera, renderer, controls, directionalLight, composer, shivling, circle;
let mouse = { x: 0, y: 0 };

const container = document.getElementById('canvas');
const originalPosition = new THREE.Vector3();
const originalScale = new THREE.Vector3();
const newPosition = new THREE.Vector3();
const newScale = new THREE.Vector3();

const originalCirclePosition = new THREE.Vector3();
const newCirclePosition = new THREE.Vector3();

let smoothness = .02;

let fullyLoaded = false;

let addRowSet = false;




function init() {
    //edit page
    // Edit functionality removed for production

    // Save functionality removed for production

    // makeStatic() removed for production

    // Scene
    scene = new THREE.Scene();

    // Renderer
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    canvas.appendChild(renderer.domElement);

    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;

    composer = new EffectComposer(renderer);

    // Camera
    let screenWidth = container.offsetWidth,
        screenHeight = container.offsetHeight,
        fov = 20,
        nearDistance = .1,
        farDistance = 1000;
    camera = new THREE.PerspectiveCamera(fov, screenWidth / screenHeight, nearDistance, farDistance);
    camera.position.x = -22.880;
    camera.position.y = 5.100;
    camera.position.z = 0;
    camera.rotation.x = -90.00;
    camera.rotation.y = -79.03;
    camera.rotation.z = -90.00;
    window.addEventListener('resize', onWindowResize, false);
    document.addEventListener('scroll', onScroll, false);

    // controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.update();
    controls.enabled = false;

    // mouse light
    directionalLight = new THREE.DirectionalLight(0xffe88f, .7);
    directionalLight.position.set(0, 0, 0);
    scene.add(directionalLight);
    document.addEventListener('mousemove', onMouseMove, false);

    // loader
    const loadingManager = new THREE.LoadingManager(() => {
        setTimeout(function () {
            // console.log('loading...');
        }, 500);
    });

    const checkFullyLoaded = () => {
        if (!fullyLoaded) {
            // console.log('loading...');
            requestAnimationFrame(checkFullyLoaded);
        } else {
            // console.log('loaded!');
            const loadingScreen = document.getElementById('loading-screen');
            loadingScreen.classList.add('fade-out');
            loadingScreen.style.zIndex = "-100";
            document.body.style.overflowY = "visible";
        }
    };
    requestAnimationFrame(checkFullyLoaded);


    // Shivling render
    const envmaploader = new THREE.PMREMGenerator(renderer);
    new RGBELoader(loadingManager).setPath('assets/').load('Studio.hdr', function (hdrmap) {
        let envmap = envmaploader.fromCubemap(hdrmap);
        let texture = new THREE.CanvasTexture(new FlakesTexture());
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.x = 10;
        texture.repeat.y = 6;
        const ballMaterial = {
            clearcoat: 0,
            clearcoatRoughness: 0.1,
            metalness: 0,
            roughness: .4,
            color: 0x020203,
            normalMap: texture,
            normalScale: new THREE.Vector2(0.01, 0.01),
            envMap: envmap.texture
        };
        const loader = new GLTFLoader();
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath("assets/draco/gltf/");
        loader.setDRACOLoader(dracoLoader);

        loader.load('assets/compressed.glb', function (gltf) {
            let ballMat = new THREE.MeshPhysicalMaterial(ballMaterial);
            gltf.scene.scale.set(.9, .9, .9);
            gltf.scene.translateY(-.3);
            shivling = gltf.scene;
            shivling.traverse((o) => { if (o.isMesh) o.material = ballMat });
            directionalLight.target = shivling;
            scene.add(shivling);

            originalPosition.copy(shivling.position)
            originalScale.copy(shivling.scale)
            newPosition.copy(shivling.position)
            newScale.copy(shivling.scale)
            fullyLoaded = true;
        }, undefined, function (error) { console.error(error); });
    });

    // volumetric light
    let circleGeo = new THREE.CircleGeometry(40, 50);
    let circleMat = new THREE.MeshBasicMaterial({ color: 0xffccaa });
    circleMat.transparent = true;
    circleMat.opacity = .1;
    circleMat.depthWrite = false;
    circle = new THREE.Mesh(circleGeo, circleMat);
    circle.position.set(500, -100, 0);
    originalCirclePosition.copy(circle.position)
    newCirclePosition.copy(circle.position)
    circle.rotation.set(90, 10.97, 90);
    circle.scale.setZ(1.2);
    scene.add(circle);

    let godraysEffect = new GodRaysEffect(camera, circle, {
        resolutionScale: 1,
        density: 1,
        decay: 0.98,
        weight: 0.5,
        samples: 100
    });

    composer.addPass(new RenderPass(scene, camera));
    const effectPass = new EffectPass(camera, godraysEffect);
    effectPass.renderToScreen = true;
    composer.addPass(effectPass);


    requestAnimationFrame(function render() {

        requestAnimationFrame(render);
        composer.render();

    });
}

function render() {
    composer.render(0.1);
    requestAnimationFrame(render);
    // renderer.render(scene, camera);
    // requestAnimationFrame(render);
    controls.update();
    try {
        shivling.position.lerp(newPosition, smoothness)
        shivling.scale.lerp(newScale, smoothness)
        circle.position.lerp(newCirclePosition, .06)
    }
    catch (err) {
    }

}

function onMouseMove(event) {
    event.preventDefault();

    // get mouse position on screen
    mouse.x = (event.clientX / container.offsetWidth) * 2 - 1;
    mouse.y = -(event.clientY / container.offsetHeight) * 2 + 1;

    // get projected mouse position in world and place camera on it
    let vector = new THREE.Vector3(mouse.x, mouse.y, .5);
    vector.unproject(camera);
    let dir = vector.sub(camera.position).normalize();
    let distance = -camera.position.x / dir.x;
    let pos = camera.position.clone().add(dir.multiplyScalar(distance));
    // console.log("x: " + pos.x + " y: " + pos.y + " z: " + pos.z);
    directionalLight.position.copy(pos);
}

function onWindowResize() {
    camera.aspect = container.offsetWidth / container.offsetHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.offsetWidth, container.offsetHeight);

}

function onScroll(event) {
    event.preventDefault();
    const position = document.documentElement.scrollTop;
    const pageHeight = document.body.clientHeight;
    const webcontentHeight = document.getElementById("website-content").offsetHeight;

    // if at the top page
    if (position < pageHeight / 2) {
        shivling.rotation.y = 0;
        newScale.copy(originalScale);
        newPosition.copy(originalPosition);
    }
    else if (position >= pageHeight / 2 && position < pageHeight) {
        const progressPercentage = (position - pageHeight / 2) / (pageHeight / 2)
        shivling.rotation.y = - progressPercentage * (Math.PI / 2);
        newScale.set(.5, .5, .5);
        newPosition.copy(originalPosition);
    }
    else if (position >= pageHeight && position < pageHeight + 50) {
        shivling.rotation.y = - (Math.PI / 2);
        newScale.set(.5, .5, .5);
        newPosition.copy(originalPosition);
    }
    else if (position >= pageHeight + 50 && position < pageHeight * 2) {
        shivling.rotation.y = - (Math.PI / 2);
        newScale.set(.5, .5, .5);
        newPosition.z = 4.2;
    }

    if (position >= pageHeight * 2) {
        newScale.set(.5, .5, .5);
        newPosition.z = 4.2;
        let progressPercentageModifier = (position - pageHeight * 2) / (webcontentHeight - pageHeight * 2);
        shivling.rotation.y = + progressPercentageModifier * (Math.PI / 2) - (Math.PI / 2);
    }

    // content
    if (position >= pageHeight) {
        const progressPercentage = (position - pageHeight) / (pageHeight)
        const radius = (1 - progressPercentage) * 50 + .5
        document.getElementById('content').style.borderTopRightRadius = radius + "vw";
    }

    // light
    if (position >= pageHeight * 1.6) {
        newCirclePosition.x = 1100;
        newCirclePosition.y = 100;
    }
    else {
        newCirclePosition.copy(originalCirclePosition);
    }
}


async function showPrompt() {
    var password = prompt("Enter the password:");
    if (password !== null) {
        var hashedPassword = await sha256(password);
        if (hashedPassword === "e8a803a55f1796726e1c0f1a50bb295d4a948f9ae31bfef71b5bcea05628d843") {
            makeEditable();
        } else {
            alert("Incorrect password!");
        }
    }
}

function makeEditable() {
    let text = document.querySelectorAll("h1, h2, h3, h4, h5, h6, p, td");
    let image = document.querySelectorAll("img");

    const save_button = document.getElementById('savebutton');
    save_button.style.visibility = "visible";


    text.forEach(function (element) {
        element.contentEditable = true;
    });

    image.forEach(function (element) {
        element.onclick = function () {
            uploadImage(element);
        };
    });

    let tables = document.querySelectorAll(".edit_tables");

    // Show add and remove row buttons for each table
    tables.forEach(function (table) {
        let addRowButton = table.nextElementSibling;
        let removeRowButton = addRowButton.nextElementSibling;
        addRowButton.style.display = "inline-block";
        removeRowButton.style.display = "inline-block";

        // Add event listeners to buttons
        addRowButton.onclick = function () {
            addRow(table);
        };

        removeRowButton.onclick = function () {
            removeRow(table);
        };
    });
}

function makeStatic() {
    let text = document.querySelectorAll("h1, h2, h3, h4, h5, h6, p, td");
    let image = document.querySelectorAll("img");

    const save_button = document.getElementById('savebutton');
    save_button.style.visibility = "hidden";


    text.forEach(function (element) {
        element.contentEditable = false;
    });

    image.forEach(function (element) {
        element.onclick = null;
    });

    let buttons = document.querySelectorAll(".add-row, .remove-row");

    // Hide add and remove row buttons
    buttons.forEach(function (button) {
        button.style.display = "none";
    });
}

function addRow(table) {
    console.log(table)
    let lastRow = table.tBodies[table.tBodies.length - 1];
    let newRow = lastRow.cloneNode(true);
    console.log(lastRow)
    console.log(newRow)
    table.appendChild(newRow);
    makeStatic();
    makeEditable();
}

function removeRow(table) {
    // Remove the last row from the table
    let rowCount = table.tBodies.length;
    if (rowCount > 1) {
        table.removeChild(table.getElementsByTagName("tbody")[rowCount - 1]);
    }
    makeStatic();
    makeEditable();
}

function saveChanges() {
    let htmlContent = '<!DOCTYPE html>\n<html>\n' + document.documentElement.innerHTML + '\n</html>';

    // Remove unwanted attributes from the canvas element
    htmlContent = htmlContent.replace(/<div id="canvas">(.*?)<\/div>/g, '<div id="canvas"></div>');
    // Remove any <link> tag with id="shut-up-css"
    htmlContent = htmlContent.replace(/<link\b[^>]*?\b(id="shut-up-css")[^>]*?>/g, '');
    // Remove any <auto-scroll> tags
    htmlContent = htmlContent.replace(/<auto-scroll\b[^>]*?>.*?<\/auto-scroll>/g, '');

    // Send the updated HTML content to the server
    fetch('/save', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ html: htmlContent })
    })
        .then(response => {
            if (response.ok) {
                alert("Changes saved successfully!");
                const save_button = document.getElementById('savebutton');
                save_button.style.visibility = "hidden";
            } else {
                alert("Failed to save! Please see the console for more information.");
                throw new Error('Failed to save changes');
            }
        })
        .catch(error => console.error('Error:', error));

    makeStatic();
}

function uploadImage(element) {
    var fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = function () {
        var file = fileInput.files[0];
        var reader = new FileReader();
        reader.onload = function (e) {
            var img = new Image();
            img.onload = function () {
                var quality = 0.9; // Adjust quality as needed
                var compressedImage = compressImage(img, quality);
                saveCompressedImage(compressedImage)
                    .then(response => {
                        if (response.success) {
                            element.src = response.imageUrl;
                            // Update the href attribute of the grandparent <a> tag
                            if (element.parentElement && element.parentElement.parentElement && element.parentElement.parentElement.tagName === 'A') {
                                element.parentElement.parentElement.href = response.imageUrl;
                            }
                        } else {
                            alert("Failed to upload compressed image!");
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        alert("Failed to upload compressed image!");
                    });
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    };
    fileInput.click();
}

async function saveCompressedImage(compressedImage) {
    const formData = new FormData();
    // Create a Blob object from the base64 encoded image data
    const blob = await base64ToBlob(compressedImage);
    // Append the Blob object to the form data
    formData.append('image', blob, 'compressed.jpg');

    try {
        const response = await fetch('/upload-compressed-image', {
            method: 'POST',
            body: formData,
        });
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        return { success: false, error: 'Failed to upload image' };
    }
}

// Function to convert base64 data to Blob object
function base64ToBlob(base64Data) {
    const byteCharacters = atob(base64Data.split(',')[1]);
    const byteArrays = [];
    for (let i = 0; i < byteCharacters.length; i++) {
        byteArrays.push(byteCharacters.charCodeAt(i));
    }
    return new Blob([new Uint8Array(byteArrays)], { type: 'image/jpeg' });
}


function compressImage(img, quality) {
    var MAX_SIZE = 1024 * 1024; // 1MB in bytes
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    var width = img.width;
    var height = img.height;
    var ratio = width * height / MAX_SIZE;

    // If the image size exceeds 1MB, compress it
    if (ratio > 1) {
        var scaleFactor = Math.sqrt(ratio);
        width /= scaleFactor;
        height /= scaleFactor;
    }

    canvas.width = width;
    canvas.height = height;
    // Draw image on canvas
    ctx.drawImage(img, 0, 0, width, height);
    // Convert canvas to base64 encoded image
    return canvas.toDataURL('image/jpeg', quality);
}

async function sha256(message) {
    // encode as UTF-8
    const msgBuffer = new TextEncoder().encode(message);

    // hash the message
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);

    // convert ArrayBuffer to Array
    const hashArray = Array.from(new Uint8Array(hashBuffer));

    // convert bytes to hex string                  
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}


document.addEventListener('DOMContentLoaded', function () {
    init();
    render();
});
