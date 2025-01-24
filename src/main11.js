import * as THREE from "three";
import { Pane } from "tweakpane";
import { ViewportGizmo } from "three-viewport-gizmo"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";


// Create a scene
const scene = new THREE.Scene();
scene.background = new THREE.Color("white");

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


const size = 1000;
const divisions = 1000;

// Create grid helpers for all three planes
const gridXZ = new THREE.GridHelper(size, divisions, 0x888888, 0x444444); // XZ plane
const gridXY = new THREE.GridHelper(size, divisions, 0x888888, 0x444444); // XY plane
const gridYZ = new THREE.GridHelper(size, divisions, 0x888888, 0x444444); // YZ plane

// Rotate grids to align with respective planes
gridXY.rotation.x = Math.PI / 2; // Align with the XY plane
gridYZ.rotation.z = Math.PI / 2; // Align with the YZ plane

// Add grids to the scene
scene.add(gridXZ);
scene.add(gridXY);
scene.add(gridYZ);

const mygroup = new THREE.Group();
scene.add(mygroup)

const objects = [];
let selectedObject = null; // Currently selected object
let isDragging = false; // Track dragging state

// Default material
const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

const options = {
  container: document.body, // Attach to the body or any specific container
  size: 150,               // Set the size of the gizmo
  placement: 'bottom-left', // Position at the bottom-left corner
  lineWidth: 2,             // Thickness of the axis lines
  offset: {
    left: 10,   // Offset from the left edge
    top: 0,
    right: 0,
    bottom: 10, // Offset from the bottom edge
  },
  backgroundSphere: {
    enabled: true, // Enable the background sphere
    color: 0x333333, // Set a dark gray background
    opacity: 0.8,    // Make it slightly transparent
  },
  x: {
    text: 'X',
    drawCircle: true,
    drawLine: true,
    colors: { main: 0xff0000 }, // Red for the X axis
  },
  y: {
    text: 'Y',
    drawCircle: true,
    drawLine: true,
    colors: { main: 0x00ff00 }, // Green for the Y axis
  },
  z: {
    text: 'Z',
    drawCircle: true,
    drawLine: true,
    colors: { main: 0x0000ff }, // Blue for the Z axis
  },
};

const gizmo = new ViewportGizmo(camera, renderer, options);
gizmo.attachControls(controls);
console.log(gizmo.domElement);

// Tweakpane
const pane = new Pane();
const params = {
    selectedObject: "None", // Change from null to "None"
    selectedObjectName: "None",
    geometry: "Sphere",
  
    color: "#ff0000",
};


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
    mesh.position.set(0, 0, 0);
    mesh.name = `Object ${objectCounter++}`;
    mygroup.add(mesh);
    objects.push(mesh);
    
    updateObjectSelector();
    return mesh;
}

// Modified updateObjectSelector function
function updateObjectSelector() {
    // Remove existing selector if it exists
    const existingFolder = pane.children.find(child => child.title === 'Object Selection');
    if (existingFolder) {
        pane.remove(existingFolder);
    }

    // Create a new folder for object selection
    const folder = pane.addFolder({
        title: 'Object Selection',
    });

    // Create options
    const options = {
        "None": "None"
    };
    
    objects.forEach((obj, idx) => {
        options[obj.name] = obj.name;
    });

    // Add selector to folder
    folder.addBinding(params, "selectedObject", {
        options: options,
    }).on("change", (ev) => {
        if (ev.value === "None") {
            selectObject(null);
        } else {
            const selectedObj = objects.find(obj => obj.name === ev.value);
            selectObject(selectedObj);
        }
    });
}

// Select an object
function selectObject(object) {
    selectedObject = object;
    if (selectedObject) {
        params.selectedObject = selectedObject.name;
        params.selectedObjectName = selectedObject.name;
        
        params.color = `#${selectedObject.material.color.getHexString()}`;

    } else {
        params.selectedObject = "None";
        params.selectedObjectName = "None";
    

    }
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
})

pane.addButton({ title: "Add Geometry" }).on("click", () => {
    addObject(params.geometry);
});



// Bind color control
pane.addBinding(params, "color").on("change", (ev) => {
    if (selectedObject) selectedObject.material.color.set(ev.value);
});

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
    console.log("Keydown event detected:", event.key);group
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

       //rotate group
       if (keysPressed["g"]) mygroup.rotation.y -= rotationSpeed;
       if (keysPressed["b"]) mygroup.rotation.y += rotationSpeed;
       if (keysPressed["h"]) mygroup.rotation.x -= rotationSpeed;
       if (keysPressed["f"]) mygroup.rotation.x += rotationSpeed;
       if (keysPressed["n"]) mygroup.rotation.z -= rotationSpeed;
       if (keysPressed["v"]) mygroup.rotation.z += rotationSpeed;
       mygroup.updateMatrixWorld(true); 
    
}

// Mouse interaction
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();


canvas.addEventListener("mousedown", (event) => {
    event.preventDefault();

    // Convert mouse coordinates to normalized device coordinates
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Set the raycaster to the mouse position and camera
    raycaster.setFromCamera(mouse, camera);

    // Intersect with objects in the scene
    const intersects = raycaster.intersectObjects(objects, true);
    controls.enabled = false
    if (intersects.length > 0) {
        const clickedObject = intersects[0].object; // Get the first intersected object
        selectObject(clickedObject); // Select and update Tweakpane
        isDragging = true; // Enable dragging state
        console.log(`Object clicked: ${clickedObject.name}`); // Debugging log
    } else {
        console.log("No objects intersected."); // Debugging log
    }
});

// Handle mousemove for dragging functionality
canvas.addEventListener("mousemove", (event) => {
    if (!isDragging || !selectedObject) return;

    // Update mouse position
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Update raycaster with the camera and current mouse position
    raycaster.setFromCamera(mouse, camera);

    // Dynamically calculate the dragging plane based on `mygroup`'s current orientation
    const groupWorldQuaternion = new THREE.Quaternion();
    mygroup.getWorldQuaternion(groupWorldQuaternion); // Get world rotation of `mygroup`

    const groupNormal = new THREE.Vector3(0, 1, 0).applyQuaternion(groupWorldQuaternion); // Adjust the normal
    const plane = new THREE.Plane(groupNormal, -mygroup.position.y); // Dynamic plane for dragging

    // Intersect the ray with the dynamic plane
    const intersection = new THREE.Vector3();
    raycaster.ray.intersectPlane(plane, intersection);

    // Transform the intersection point back into the local space of the `mygroup`
    const localIntersection = mygroup.worldToLocal(intersection);

    // Set the object's position relative to the group
    selectedObject.position.copy(localIntersection);
});



canvas.addEventListener("mouseup", () => {
    isDragging = false;
    controls.enabled = true; // Re-enable orbit controls when dragging stops
});


function initScene() {
    // Add initial sphere after all Tweakpane setup
    const sphere = addObject("Sphere");
    selectObject(sphere);
}


// Call initialization after all setup is complete
initScene()

// Animation loop
function animate() {
    requestAnimationFrame(animate);

   
    handleKeyboardMovement();

    controls.update();
    renderer.render(scene, camera);
    gizmo.render();
}

animate();

// Handle window resizing
window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    gizmo.update();
});
