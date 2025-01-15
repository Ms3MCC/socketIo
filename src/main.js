
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Pane } from "tweakpane";

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
const material = new THREE.MeshStandardMaterial({ color: 0xff0000});
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
});
pane.addBinding(params, "positionY", { min: -100, max: 100, step: 0.1 }).on("change", (ev) => {
    mesh.position.y = ev.value;
});
pane.addBinding(params, "positionZ", { min: -100, max: 100, step: 0.1 }).on("change", (ev) => {
    mesh.position.z = ev.value;
});

// Bind color control
pane.addBinding(params, "color").on("change", (ev) => {
    mesh.material.color.set(ev.value);
});

pane.addBinding(params, "rotationX", { min: -Math.PI * 2, max: Math.PI * 2, step: 0.01 }).on("change", (ev) => {
    mesh.rotation.x = ev.value;
});
pane.addBinding(params, "rotationY", { min: -Math.PI * 2, max: Math.PI * 2, step: 0.01 }).on("change", (ev) => {
    mesh.rotation.y = ev.value;
});
pane.addBinding(params, "rotationZ", { min: -Math.PI * 2, max: Math.PI * 2, step: 0.01 }).on("change", (ev) => {
    mesh.rotation.z = ev.value;
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
// document.addEventListener("keydown", (event) => {
//     keysPressed[event.key] = true;
//     event.preventDefault();
//     console.log("Keydown event detected:", event.key);
// });

document.addEventListener("keydown", (event) => {
    // List of keys that should not trigger preventDefault (like F12, F1, and others used for dev tools)
    const devToolsKeys = [
        "F12", "F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "F10", "F11",
        "Control", "Shift", "I", "i", 
        "Meta", // Command key on macOS
        "Option", // Option key on macOS
        "C","c","0","1","2","3","4","5","6","7","8","9",".","Delete", "Enter", "Backspace"  // To allow "Option + Command + C" on macOS
    ];

    // Prevent default behavior for movement keys, but not dev tools keys
    if (!devToolsKeys.includes(event.key) && !(event.metaKey || event.altKey)) {
        event.preventDefault();
    }

    keysPressed[event.key] = true;
    console.log("Keydown event detected:", event.key);
});

document.addEventListener("keyup", (event) => {
    keysPressed[event.key] = false;
});



// Keyboard movement logic
function handleKeyboardMovement() {
    // Move along the XZ plane
    if (keysPressed["ArrowUp"]) {
        mesh.position.z -= moveSpeed; // Move forward
    }
    if (keysPressed["ArrowDown"]) {
        mesh.position.z += moveSpeed; // Move backward
    }
    if (keysPressed["ArrowLeft"]) {
        mesh.position.x -= moveSpeed; // Move left
    }
    if (keysPressed["ArrowRight"]) {
        mesh.position.x += moveSpeed; // Move right
    }

    // Move along the Y-axis
    if (keysPressed[" "]) {
        mesh.position.y += moveSpeed; // Move up (Space key)
    }
    if (keysPressed["Shift"]) {
        mesh.position.y -= moveSpeed; // Move down (Shift key)
    }

    // rotation
    if (keysPressed["w"]) {
        mesh.rotation.x -= rotationSpeed;
    }
    if ( keysPressed["s"]) {
        mesh.rotation.x += rotationSpeed;  
    }
    if (keysPressed["a"]) {
        mesh.rotation.y -= rotationSpeed;
    }
    if (keysPressed["d"]) {
        mesh.rotation.y += rotationSpeed; 
    }
    if (keysPressed["q"]) {
        mesh.rotation.z -= rotationSpeed; 
    }
    if (keysPressed["e"]) {
        mesh.rotation.z += rotationSpeed; 
    }



    // Update Tweakpane values
    params.positionX = mesh.position.x;
    params.positionY = mesh.position.y;
    params.positionZ = mesh.position.z;
    params.rotationX = mesh.rotation.x;
    params.rotationY = mesh.rotation.y;
    params.rotationZ = mesh.rotation.z;
    pane.refresh(); // Refresh pane to reflect updated values
}

// Event listeners for mouse interactions (dragging)
canvas.addEventListener("mousedown", (event) => {
    isDragging = true;
    controls.enabled = false; // Disable OrbitControls while dragging
});

canvas.addEventListener("mouseup", () => {
    isDragging = false;
    controls.enabled = true; // Re-enable OrbitControls after dragging
});

canvas.addEventListener("mousemove", (event) => {
    if (!isDragging) return; // Only move the mesh when the mouse is pressed

    // Normalize mouse coordinates to [-1, 1]
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Cast a ray from the camera in the direction of the mouse position
    raycaster.setFromCamera(mouse, camera);

    // Move the mesh along the raycaster's direction
    const distanceFromCamera = 5; // Set a fixed distance from the camera
    const newPosition = new THREE.Vector3();
    newPosition
        .copy(raycaster.ray.origin)
        .add(raycaster.ray.direction.multiplyScalar(distanceFromCamera));

    // Update the mesh's position
    mesh.position.copy(newPosition);

    // Update Tweakpane values
    params.positionX = mesh.position.x;
    params.positionY = mesh.position.y;
    params.positionZ = mesh.position.z;

    pane.refresh(); // Refresh pane to reflect new values
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Handle keyboard movement
    handleKeyboardMovement();

    controls.update();
    renderer.render(scene, camera);
}

animate();

// Handle window resizing
window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
