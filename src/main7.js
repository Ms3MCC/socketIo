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

const group = new THREE.Group();
scene.add(group)

const newGeometry = new THREE.SphereGeometry(0.5, 32, 32);
const newGeometry2 = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshStandardMaterial({ color: 0xff0000});

const  mesh = new THREE.Mesh(newGeometry, material);
mesh.position.set(1,1,1)
group.add(mesh)

const mesh2=new THREE.Mesh(newGeometry2, material);
mesh2.position.set(-2,-2,-2)

group.add(mesh2)

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

const pane = new Pane();

const params = {
  
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
};

pane.addBinding(params, "rotationX", { min: -Math.PI * 2, max: Math.PI * 2, step: 0.01 }).on("change", (ev) => {
    group.rotation.x = ev.value;
});
pane.addBinding(params, "rotationY", { min: -Math.PI * 2, max: Math.PI * 2, step: 0.01 }).on("change", (ev) => {
    group.rotation.y = ev.value;
});
pane.addBinding(params, "rotationZ", { min: -Math.PI * 2, max: Math.PI * 2, step: 0.01 }).on("change", (ev) => {
    group.rotation.z = ev.value;
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