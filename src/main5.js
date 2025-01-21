

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

// Store objects
const objects = [];
let selectedObject = null; // Currently selected object
let isDragging = false; // Track dragging state

// Default material
const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// Tweakpane
const pane = new Pane();
const params = {
    selectedObject: null, // Object selection
    selectedObjectName: "None", // Name of the selected object
    geometry: "Sphere",
    positionX: 0,
    positionY: 0,
    positionZ: 0,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    color: "#ff0000", // Mesh color
};

// Assign unique IDs for objects
let objectCounter = 1;

// Function to create and add a new object
function addObject(geometryType) {
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

    const mesh = new THREE.Mesh(geometry, material.clone());
    mesh.position.set(0, 0, 0); // Default position
    mesh.name = `Object ${objectCounter++}`; // Assign a unique name
    scene.add(mesh);
    objects.push(mesh);

    // Update Tweakpane object list
    updateObjectSelector();
    return mesh;
}

// Update Tweakpane object selector
function updateObjectSelector() {
    const options = objects.reduce((acc, obj, idx) => {
        acc[`Object ${idx + 1}`] = idx;
        return acc;
    }, {});
    pane.addBinding(params, "selectedObject", {
        options,
    }).on("change", (ev) => {
        selectObject(objects[ev.value]);
    });
}

// Select an object
function selectObject(object) {
    selectedObject = object;
    if (selectedObject) {
        params.selectedObjectName = selectedObject.name; // Update selected object name
        params.positionX = selectedObject.position.x;
        params.positionY = selectedObject.position.y;
        params.positionZ = selectedObject.position.z;
        params.rotationX = selectedObject.rotation.x;
        params.rotationY = selectedObject.rotation.y;
        params.rotationZ = selectedObject.rotation.z;
        params.color = `#${selectedObject.material.color.getHexString()}`;
        pane.refresh();

        // Align axis ball
        axisBallGroup.position.copy(selectedObject.position);
        axisBallGroup.rotation.copy(selectedObject.rotation);
        axisBallGroup.visible = true;
    } else {
        params.selectedObjectName = "None";
        axisBallGroup.visible = false;
    }
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
    addObject(ev.value);
});

// Add selectedObjectName field to Tweakpane
pane.addBinding(params, "selectedObjectName", {
    label: "Selected Object",
    view: "text", // Make it a read-only text field
});

// Bind position controls
pane.addBinding(params, "positionX", { min: -100, max: 100, step: 0.1 }).on("change", (ev) => {
    if (selectedObject) selectedObject.position.x = ev.value;
});
pane.addBinding(params, "positionY", { min: -100, max: 100, step: 0.1 }).on("change", (ev) => {
    if (selectedObject) selectedObject.position.y = ev.value;
});
pane.addBinding(params, "positionZ", { min: -100, max: 100, step: 0.1 }).on("change", (ev) => {
    if (selectedObject) selectedObject.position.z = ev.value;
});

// Bind rotation controls
pane.addBinding(params, "rotationX", { min: -Math.PI * 2, max: Math.PI * 2, step: 0.01 }).on("change", (ev) => {
    if (selectedObject) selectedObject.rotation.x = ev.value;
});
pane.addBinding(params, "rotationY", { min: -Math.PI * 2, max: Math.PI * 2, step: 0.01 }).on("change", (ev) => {
    if (selectedObject) selectedObject.rotation.y = ev.value;
});
pane.addBinding(params, "rotationZ", { min: -Math.PI * 2, max: Math.PI * 2, step: 0.01 }).on("change", (ev) => {
    if (selectedObject) selectedObject.rotation.z = ev.value;
});

// Bind color control
pane.addBinding(params, "color").on("change", (ev) => {
    if (selectedObject) selectedObject.material.color.set(ev.value);
});

// Axis ball
// Create axis ball
const axisBallGroup = new THREE.Group();
scene.add(axisBallGroup);

const createAxisLine = (color, direction) => {
    const material = new THREE.LineBasicMaterial({ color });
    const points = [
        new THREE.Vector3(0, 0, 0),
        direction.clone().multiplyScalar(1.5),
    ];
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    return new THREE.Line(geometry, material);
};

const xAxis = createAxisLine(0xff0000, new THREE.Vector3(1, 0, 0));
const yAxis = createAxisLine(0x00ff00, new THREE.Vector3(0, 1, 0));
const zAxis = createAxisLine(0x0000ff, new THREE.Vector3(0, 0, 1));
axisBallGroup.add(xAxis, yAxis, zAxis);

// Position labels (optional)
const createAxisLabel = (text, color, position) => {
    const spriteMaterial = new THREE.SpriteMaterial({
        map: new THREE.CanvasTexture(
            createTextTexture(text, color)
        ),
        sizeAttenuation: false,
    });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.position.copy(position);
    sprite.scale.set(0.5, 0.5, 0.5); // Adjust label size
    return sprite;
};

const createTextTexture = (text, color) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = 128;
    canvas.height = 64;
    ctx.fillStyle = color;
    ctx.font = "24px Arial";
    ctx.fillText(text, 10, 40);
    return canvas;
};

axisBallGroup.add(createAxisLabel("X", "red", new THREE.Vector3(2, 0, 0)));
axisBallGroup.add(createAxisLabel("Y", "green", new THREE.Vector3(0, 2, 0)));
axisBallGroup.add(createAxisLabel("Z", "blue", new THREE.Vector3(0, 0, 2)));

// Keyboard and mouse handling
const keysPressed = {};
const moveSpeed = 0.1;
const rotationSpeed = 0.05;


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

function handleKeyboardMovement() {
    if (selectedObject) {
        // Move along the XZ plane
        if (keysPressed["ArrowUp"]) selectedObject.position.z -= moveSpeed;
        if (keysPressed["ArrowDown"]) selectedObject.position.z += moveSpeed;
        if (keysPressed["ArrowLeft"]) selectedObject.position.x -= moveSpeed;
        if (keysPressed["ArrowRight"]) selectedObject.position.x += moveSpeed;

        // Move along the Y-axis
        if (keysPressed[" "]) selectedObject.position.y += moveSpeed; // Space key
        if (keysPressed["Shift"]) selectedObject.position.y -= moveSpeed;

        // Rotate
        if (keysPressed["w"]) selectedObject.rotation.x -= rotationSpeed;
        if (keysPressed["s"]) selectedObject.rotation.x += rotationSpeed;
        if (keysPressed["a"]) selectedObject.rotation.y -= rotationSpeed;
        if (keysPressed["d"]) selectedObject.rotation.y += rotationSpeed;
        if (keysPressed["q"]) selectedObject.rotation.z -= rotationSpeed;
        if (keysPressed["e"]) selectedObject.rotation.z += rotationSpeed;

        // Update Tweakpane
        params.positionX = selectedObject.position.x;
        params.positionY = selectedObject.position.y;
        params.positionZ = selectedObject.position.z;
        params.rotationX = selectedObject.rotation.x;
        params.rotationY = selectedObject.rotation.y;
        params.rotationZ = selectedObject.rotation.z;
        pane.refresh();
    }
}

// Mouse interaction
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

canvas.addEventListener("mousedown", (event) => {
    // Cast a ray to detect the clicked object
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    controls.enabled = false; // Disable orbit controls while dragging
    const intersects = raycaster.intersectObjects(objects);
    if (intersects.length > 0) {
        selectObject(intersects[0].object); // Select the clicked object
        isDragging = true;
    }
});

canvas.addEventListener("mousemove", (event) => {
    if (!isDragging || !selectedObject) return;

    // Normalize mouse coordinates to [-1, 1]
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const distanceFromCamera = 5; // Fixed distance for dragging
    const newPosition = new THREE.Vector3();
    newPosition
        .copy(raycaster.ray.origin)
        .add(raycaster.ray.direction.multiplyScalar(distanceFromCamera));

    selectedObject.position.copy(newPosition);
    params.positionX = selectedObject.position.x;
    params.positionY = selectedObject.position.y;
    params.positionZ = selectedObject.position.z;
    pane.refresh();
});

canvas.addEventListener("mouseup", () => {
    isDragging = false;
    controls.enabled = true; // Re-enable orbit controls when dragging stops
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    if (selectedObject) {
        axisBallGroup.position.copy(selectedObject.position);
        axisBallGroup.rotation.copy(selectedObject.rotation);
    }
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
