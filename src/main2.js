import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Pane } from "tweakpane";
import { io } from "socket.io-client";

// Replace with your Socket.IO server's IP or domain name
const socket = io("http://10.237.23.91:5000"); // Update with your server's address
// Event listener for successful connection
socket.on("connect", () => {
    console.log("Connected to the Socket.IO server with ID:", socket.id);
    // You can update your UI here to indicate successful connection, e.g.
    // document.getElementById('status').textContent = 'Connected';
});

// Event listener for connection error
socket.on("connect_error", (error) => {
    console.error("Connection failed:", error);
    // You can update your UI here to indicate connection failure, e.g.
    // document.getElementById('status').textContent = 'Connection Failed';
});

// Event listener for disconnect event
socket.on("disconnect", () => {
    console.log("Disconnected from the server");
    // You can update your UI here to indicate disconnection, e.g.
    // document.getElementById('status').textContent = 'Disconnected';
});

// Create a scene
const scene = new THREE.Scene();
scene.background = new THREE.Color("black");

// Setup a camera
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    1,
    2000
);
camera.position.set(0, 5, 15);

// Setup the renderer and attach to canvas
const canvas = document.querySelector("canvas.threejs");
const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// Add lights
const ambientLight = new THREE.AmbientLight(0x404040, 2000);
scene.add(ambientLight);

// Default geometry and material
let currentGeometry = new THREE.SphereGeometry(0.5, 32, 32);
const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
let mesh = new THREE.Mesh(currentGeometry, material);
scene.add(mesh);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// Tweakpane
const pane = new Pane();
const params = {
    geometry: "Sphere",
    positionX: mesh.position.x,
    positionY: mesh.position.y,
    positionZ: mesh.position.z,
    rotationX: mesh.rotation.x, // Rotation around X-axis
    rotationY: mesh.rotation.y, // Rotation around Y-axis
    rotationZ: mesh.rotation.z, // Rotation around Z-axis
    color: "#ff0000", // Mesh color
};

// Function to update geometry
function updateGeometry(geometryType) {
    let newGeometry;
    switch (geometryType) {
        case "Sphere":
            newGeometry = new THREE.SphereGeometry(0.5, 32, 32);
            break;
        case "Box":
            newGeometry = new THREE.BoxGeometry(1, 1, 1);
            break;
        case "Cone":
            newGeometry = new THREE.ConeGeometry(0.5, 1, 32);
            break;
        case "Cylinder":
            newGeometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 32);
            break;
        default:
            newGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    }

    // Replace the current geometry with the new one
    mesh.geometry.dispose();
    mesh.geometry = newGeometry;
    currentGeometry = newGeometry;

    // Send geometry update to the server
    socket.emit("updateGeometry", geometryType);
}

// Send initial state to the server
function sendInitialState() {
    const initialState = {
        position: {
            x: params.positionX,
            y: params.positionY,
            z: params.positionZ,
        },
        rotation: {
            x: params.rotationX,
            y: params.rotationY,
            z: params.rotationZ,
        },
        geometry: params.geometry,
        color: params.color,
    };
    socket.emit("initialState", initialState);
}

// Add geometry selector to Tweakpane
pane.addBinding(params, "geometry", {
    options: {
        Sphere: "Sphere",
        Box: "Box",
        Cone: "Cone",
        Cylinder: "Cylinder",
    },
}).on("change", (ev) => {
    updateGeometry(ev.value);
});

// Bind mesh position controls
pane.addBinding(params, "positionX", { min: -100, max: 100, step: 0.1 }).on("change", (ev) => {
    mesh.position.x = ev.value;
    socket.emit("updatePosition", { x: mesh.position.x, y: mesh.position.y, z: mesh.position.z });
});
pane.addBinding(params, "positionY", { min: -100, max: 100, step: 0.1 }).on("change", (ev) => {
    mesh.position.y = ev.value;
    socket.emit("updatePosition", { x: mesh.position.x, y: mesh.position.y, z: mesh.position.z });
});
pane.addBinding(params, "positionZ", { min: -100, max: 100, step: 0.1 }).on("change", (ev) => {
    mesh.position.z = ev.value;
    socket.emit("updatePosition", { x: mesh.position.x, y: mesh.position.y, z: mesh.position.z });
});

// Bind color control
pane.addBinding(params, "color").on("change", (ev) => {
    mesh.material.color.set(ev.value);
    socket.emit("updateColor", ev.value);
});

pane.addBinding(params, "rotationX", { min: -Math.PI * 2, max: Math.PI * 2, step: 0.01 }).on("change", (ev) => {
    mesh.rotation.x = ev.value;
    socket.emit("updateRotation", { x: mesh.rotation.x, y: mesh.rotation.y, z: mesh.rotation.z });
});
pane.addBinding(params, "rotationY", { min: -Math.PI * 2, max: Math.PI * 2, step: 0.01 }).on("change", (ev) => {
    mesh.rotation.y = ev.value;
    socket.emit("updateRotation", { x: mesh.rotation.x, y: mesh.rotation.y, z: mesh.rotation.z });
});
pane.addBinding(params, "rotationZ", { min: -Math.PI * 2, max: Math.PI * 2, step: 0.01 }).on("change", (ev) => {
    mesh.rotation.z = ev.value;
    socket.emit("updateRotation", { x: mesh.rotation.x, y: mesh.rotation.y, z: mesh.rotation.z });
});

// Raycaster and mouse
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let isDragging = false;

// Define movement speed
const moveSpeed = 0.1;
const rotationSpeed = 0.05;
// Track keys pressed
const keysPressed = {};

// Event listeners for keydown and keyup
document.addEventListener("keydown", (event) => {
    const devToolsKeys = [
        "F12", "F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "F10", "F11",
        "Control", "Shift", "Meta", "Option", "Enter", "Backspace",
    ];
    if (!devToolsKeys.includes(event.key) && !(event.metaKey || event.altKey)) {
        event.preventDefault();
    }
    keysPressed[event.key] = true;
});

document.addEventListener("keyup", (event) => {
    keysPressed[event.key] = false;
});

// Keyboard movement logic
function handleKeyboardMovement() {
    if (keysPressed["ArrowUp"]) mesh.position.z -= moveSpeed;
    if (keysPressed["ArrowDown"]) mesh.position.z += moveSpeed;
    if (keysPressed["ArrowLeft"]) mesh.position.x -= moveSpeed;
    if (keysPressed["ArrowRight"]) mesh.position.x += moveSpeed;
    if (keysPressed[" "]) mesh.position.y += moveSpeed;
    if (keysPressed["Shift"]) mesh.position.y -= moveSpeed;
    if (keysPressed["w"]) mesh.rotation.x -= rotationSpeed;
    if (keysPressed["s"]) mesh.rotation.x += rotationSpeed;
    if (keysPressed["a"]) mesh.rotation.y -= rotationSpeed;
    if (keysPressed["d"]) mesh.rotation.y += rotationSpeed;
    if (keysPressed["q"]) mesh.rotation.z -= rotationSpeed;
    if (keysPressed["e"]) mesh.rotation.z += rotationSpeed;

    // Emit position and rotation updates
    socket.emit("updatePosition", { x: mesh.position.x, y: mesh.position.y, z: mesh.position.z });
    socket.emit("updateRotation", { x: mesh.rotation.x, y: mesh.rotation.y, z: mesh.rotation.z });

    // Update Tweakpane values
    params.positionX = mesh.position.x;
    params.positionY = mesh.position.y;
    params.positionZ = mesh.position.z;
    params.rotationX = mesh.rotation.x;
    params.rotationY = mesh.rotation.y;
    params.rotationZ = mesh.rotation.z;
    pane.refresh();
}

// Event listeners for mouse interactions (dragging)
canvas.addEventListener("mousedown", () => {
    isDragging = true;
    controls.enabled = false;
});

canvas.addEventListener("mouseup", () => {
    isDragging = false;
    controls.enabled = true;
});

canvas.addEventListener("mousemove", (event) => {
    if (!isDragging) return;
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const distanceFromCamera = 5;
    const newPosition = new THREE.Vector3();
    newPosition
        .copy(raycaster.ray.origin)
        .add(raycaster.ray.direction.multiplyScalar(distanceFromCamera));
    mesh.position.copy(newPosition);
    params.positionX = mesh.position.x;
    params.positionY = mesh.position.y;
    params.positionZ = mesh.position.z;
    pane.refresh();
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    handleKeyboardMovement();
    controls.update();
    renderer.render(scene, camera);
}

animate();

// Send initial state
sendInitialState();

// Handle window resizing
window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
