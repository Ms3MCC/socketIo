// import * as THREE from "three";
// import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
// import { Pane } from "tweakpane";

// // Create a scene
// const scene = new THREE.Scene();
// scene.background = new THREE.Color("black");

// // Setup a camera
// const camera = new THREE.PerspectiveCamera(
//     75,
//     window.innerWidth / window.innerHeight,
//     1,
//     2000
// );
// camera.position.set(0, 5, 15);

// // Setup the renderer and attach to canvas
// const canvas = document.querySelector("canvas.threejs");
// const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
// renderer.setSize(window.innerWidth, window.innerHeight);
// renderer.setPixelRatio(window.devicePixelRatio);

// // Add lights
// const ambientLight = new THREE.AmbientLight(0x404040, 2000);
// scene.add(ambientLight);

// // Store all meshes in a list
// const meshes = [];

// // Controls
// const controls = new OrbitControls(camera, canvas);
// controls.enableDamping = true;

// // Tweakpane
// const pane = new Pane();
// const params = {
//     geometry: "Sphere",
//     positionX: 0,
//     positionY: 0,
//     positionZ: 0,
//     rotationX: 0,
//     rotationY: 0,
//     rotationZ: 0,
//     color: "#ff0000", // Mesh color
// };

// // Function to add a new object
// function addObject(geometryType, color) {
//     let geometry;
//     switch (geometryType) {
//         case "Sphere":
//             geometry = new THREE.SphereGeometry(0.5, 32, 32);
//             break;
//         case "Box":
//             geometry = new THREE.BoxGeometry(1, 1, 1);
//             break;
//         case "Cone":
//             geometry = new THREE.ConeGeometry(0.5, 1, 32);
//             break;
//         case "Cylinder":
//             geometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 32);
//             break;
//         default:
//             geometry = new THREE.SphereGeometry(0.5, 32, 32);
//     }

//     const material = new THREE.MeshStandardMaterial({ color: color });
//     const mesh = new THREE.Mesh(geometry, material);
//     mesh.position.set(params.positionX, params.positionY, params.positionZ);
//     mesh.rotation.set(params.rotationX, params.rotationY, params.rotationZ);

//     scene.add(mesh);
//     meshes.push(mesh);
//     selectObject(mesh); // Automatically select the newly added object
// }

// // Function to update Tweakpane controls to reflect the selected object's properties
// function selectObject(mesh) {
//     params.positionX = mesh.position.x;
//     params.positionY = mesh.position.y;
//     params.positionZ = mesh.position.z;
//     params.rotationX = mesh.rotation.x;
//     params.rotationY = mesh.rotation.y;
//     params.rotationZ = mesh.rotation.z;
//     params.color = `#${mesh.material.color.getHexString()}`;
//     pane.refresh();
// }

// // Add geometry selector to Tweakpane
// pane.addBinding(params, "geometry", {
//     options: {
//         Sphere: "Sphere",
//         Box: "Box",
//         Cone: "Cone",
//         Cylinder: "Cylinder",
//     },
// });

// // Add color selector to Tweakpane
// pane.addBinding(params, "color").on("change", (ev) => {
//     if (selectedMesh) {
//         selectedMesh.material.color.set(ev.value);
//     }
// });

// // Bind position controls
// pane.addBinding(params, "positionX", { min: -100, max: 100, step: 0.1 }).on("change", (ev) => {
//     if (selectedMesh) selectedMesh.position.x = ev.value;
// });
// pane.addBinding(params, "positionY", { min: -100, max: 100, step: 0.1 }).on("change", (ev) => {
//     if (selectedMesh) selectedMesh.position.y = ev.value;
// });
// pane.addBinding(params, "positionZ", { min: -100, max: 100, step: 0.1 }).on("change", (ev) => {
//     if (selectedMesh) selectedMesh.position.z = ev.value;
// });

// // Bind rotation controls
// pane.addBinding(params, "rotationX", { min: -Math.PI * 2, max: Math.PI * 2, step: 0.01 }).on("change", (ev) => {
//     if (selectedMesh) selectedMesh.rotation.x = ev.value;
// });
// pane.addBinding(params, "rotationY", { min: -Math.PI * 2, max: Math.PI * 2, step: 0.01 }).on("change", (ev) => {
//     if (selectedMesh) selectedMesh.rotation.y = ev.value;
// });
// pane.addBinding(params, "rotationZ", { min: -Math.PI * 2, max: Math.PI * 2, step: 0.01 }).on("change", (ev) => {
//     if (selectedMesh) selectedMesh.rotation.z = ev.value;
// });

// // Add button to create a new object
// pane.addButton({ title: "Add Object" }).on("click", () => {
//     addObject(params.geometry, params.color);
// });

// // Raycaster and mouse
// const raycaster = new THREE.Raycaster();
// const mouse = new THREE.Vector2();
// let selectedMesh = null;

// // Event listener for mouse clicks to select an object
// canvas.addEventListener("mousedown", (event) => {
//     // Normalize mouse coordinates to [-1, 1]
//     mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
//     mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

//     // Cast a ray from the camera in the direction of the mouse position
//     raycaster.setFromCamera(mouse, camera);

//     // Check for intersections with meshes
//     const intersects = raycaster.intersectObjects(meshes);
//     if (intersects.length > 0) {
//         selectedMesh = intersects[0].object;
//         selectObject(selectedMesh);
//     }
// });

// // Keyboard movement logic
// const keysPressed = {};
// const moveSpeed = 0.1;
// const rotationSpeed = 0.05;

// document.addEventListener("keydown", (event) => {
//     keysPressed[event.key] = true;
// });

// document.addEventListener("keyup", (event) => {
//     keysPressed[event.key] = false;
// });

// function handleKeyboardMovement() {
//     if (selectedMesh) {
//         // Move along the XZ plane
//         if (keysPressed["ArrowUp"]) selectedMesh.position.z -= moveSpeed;
//         if (keysPressed["ArrowDown"]) selectedMesh.position.z += moveSpeed;
//         if (keysPressed["ArrowLeft"]) selectedMesh.position.x -= moveSpeed;
//         if (keysPressed["ArrowRight"]) selectedMesh.position.x += moveSpeed;

//         // Move along the Y-axis
//         if (keysPressed[" "]) selectedMesh.position.y += moveSpeed; // Space key
//         if (keysPressed["Shift"]) selectedMesh.position.y -= moveSpeed;

//         // Rotate
//         if (keysPressed["w"]) selectedMesh.rotation.x -= rotationSpeed;
//         if (keysPressed["s"]) selectedMesh.rotation.x += rotationSpeed;
//         if (keysPressed["a"]) selectedMesh.rotation.y -= rotationSpeed;
//         if (keysPressed["d"]) selectedMesh.rotation.y += rotationSpeed;
//         if (keysPressed["q"]) selectedMesh.rotation.z -= rotationSpeed;
//         if (keysPressed["e"]) selectedMesh.rotation.z += rotationSpeed;

//         // Update Tweakpane
//         params.positionX = selectedMesh.position.x;
//         params.positionY = selectedMesh.position.y;
//         params.positionZ = selectedMesh.position.z;
//         params.rotationX = selectedMesh.rotation.x;
//         params.rotationY = selectedMesh.rotation.y;
//         params.rotationZ = selectedMesh.rotation.z;
//         pane.refresh();
//     }
// }

// // Animation loop
// function animate() {
//     requestAnimationFrame(animate);

//     // Handle keyboard movement
//     handleKeyboardMovement();

//     controls.update();
//     renderer.render(scene, camera);
// }

// animate();

// // Handle window resizing
// window.addEventListener("resize", () => {
//     camera.aspect = window.innerWidth / window.innerHeight;
//     camera.updateProjectionMatrix();
//     renderer.setSize(window.innerWidth, window.innerHeight);
// });

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

// Store all meshes in a list
const meshes = [];

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// Tweakpane
const pane = new Pane();
const params = {
    geometry: "Sphere",
    positionX: 0,
    positionY: 0,
    positionZ: 0,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    color: "#ff0000", // Mesh color
};

// Function to add a new object
function addObject(geometryType, color) {
    let geometry;
    switch (geometryType) {
        case "Sphere":
            geometry = new THREE.SphereGeometry(0.5, 32, 32);
            break;
        case "Box":
            geometry = new THREE.BoxGeometry(1, 1, 1);
            break;
        case "Cone":
            geometry = new THREE.ConeGeometry(0.5, 1, 32);
            break;
        case "Cylinder":
            geometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 32);
            break;
        default:
            geometry = new THREE.SphereGeometry(0.5, 32, 32);
    }

    const material = new THREE.MeshStandardMaterial({ color: color });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(params.positionX, params.positionY, params.positionZ);
    mesh.rotation.set(params.rotationX, params.rotationY, params.rotationZ);

    scene.add(mesh);
    meshes.push(mesh);
    selectObject(mesh); // Automatically select the newly added object
}

// Function to update Tweakpane controls to reflect the selected object's properties
function selectObject(mesh) {
    params.positionX = mesh.position.x;
    params.positionY = mesh.position.y;
    params.positionZ = mesh.position.z;
    params.rotationX = mesh.rotation.x;
    params.rotationY = mesh.rotation.y;
    params.rotationZ = mesh.rotation.z;
    params.color = `#${mesh.material.color.getHexString()}`;
    pane.refresh();
}

// Add geometry selector to Tweakpane
pane.addBinding(params, "geometry", {
    options: {
        Sphere: "Sphere",
        Box: "Box",
        Cone: "Cone",
        Cylinder: "Cylinder",
    },
});

// Add color selector to Tweakpane
pane.addBinding(params, "color").on("change", (ev) => {
    if (selectedMesh) {
        selectedMesh.material.color.set(ev.value);
    }
});

// Bind position controls
pane.addBinding(params, "positionX", { min: -100, max: 100, step: 0.1 }).on("change", (ev) => {
    if (selectedMesh) selectedMesh.position.x = ev.value;
});
pane.addBinding(params, "positionY", { min: -100, max: 100, step: 0.1 }).on("change", (ev) => {
    if (selectedMesh) selectedMesh.position.y = ev.value;
});
pane.addBinding(params, "positionZ", { min: -100, max: 100, step: 0.1 }).on("change", (ev) => {
    if (selectedMesh) selectedMesh.position.z = ev.value;
});

// Bind rotation controls
pane.addBinding(params, "rotationX", { min: -Math.PI * 2, max: Math.PI * 2, step: 0.01 }).on("change", (ev) => {
    if (selectedMesh) selectedMesh.rotation.x = ev.value;
});
pane.addBinding(params, "rotationY", { min: -Math.PI * 2, max: Math.PI * 2, step: 0.01 }).on("change", (ev) => {
    if (selectedMesh) selectedMesh.rotation.y = ev.value;
});
pane.addBinding(params, "rotationZ", { min: -Math.PI * 2, max: Math.PI * 2, step: 0.01 }).on("change", (ev) => {
    if (selectedMesh) selectedMesh.rotation.z = ev.value;
});

// Add button to create a new object
pane.addButton({ title: "Add Object" }).on("click", () => {
    addObject(params.geometry, params.color);
});

// Raycaster and mouse
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let selectedMesh = null;
let dragging = false;
let dragPlane = new THREE.Plane();
let intersection = new THREE.Vector3();
let offset = new THREE.Vector3();

// Event listener for mouse down to select an object and start dragging
canvas.addEventListener("mousedown", (event) => {
    controls.enabled = false;
    // Normalize mouse coordinates to [-1, 1]
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Cast a ray from the camera in the direction of the mouse position
    raycaster.setFromCamera(mouse, camera);

    // Check for intersections with meshes
    const intersects = raycaster.intersectObjects(meshes);
    if (intersects.length > 0) {
        selectedMesh = intersects[0].object;
        selectObject(selectedMesh);
        dragging = true;

        // Define the drag plane perpendicular to the camera
        dragPlane.setFromNormalAndCoplanarPoint(
            camera.getWorldDirection(new THREE.Vector3()),
            selectedMesh.position
        );

        // Store the initial intersection point and offset
        if (raycaster.ray.intersectPlane(dragPlane, intersection)) {
            offset.copy(intersection).sub(selectedMesh.position);
        }
    }
});

// Event listener for mouse move to drag the selected object
canvas.addEventListener("mousemove", (event) => {
    if (!dragging || !selectedMesh) return;

    // Normalize mouse coordinates to [-1, 1]
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Update the raycaster
    raycaster.setFromCamera(mouse, camera);

    // Update the position of the dragged object
    if (raycaster.ray.intersectPlane(dragPlane, intersection)) {
        selectedMesh.position.copy(intersection.sub(offset));
        params.positionX = selectedMesh.position.x;
        params.positionY = selectedMesh.position.y;
        params.positionZ = selectedMesh.position.z;
        pane.refresh();
    }
});

// Event listener for mouse up to stop dragging
canvas.addEventListener("mouseup", () => {
    dragging = false;
    controls.enabled = true;
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);
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
