//General scene creation
const THREE = require("three");

const guiManager = require('./gui-manager.js');

import CameraControls from 'camera-controls';

CameraControls.install({THREE : THREE});

const canvas = document.getElementById('canvas');
let color = new THREE.Color(0x4444411);
const scene = new THREE.Scene();
scene.background = color;
const renderer = new THREE.WebGLRenderer({canvas});
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
const clock = new THREE.Clock();


const camera = new THREE.PerspectiveCamera(70,window.innerWidth/window.innerHeight, 0.1, 500);
camera.position.set(0,4,30);
const cameraControls = new CameraControls( camera, renderer.domElement );


let light = new THREE.DirectionalLight( 0xFFFFFF, 0.6 ); // soft white light
scene.add( light );

light = new THREE.AmbientLight(0xFFFFFF, 0.3);
scene.add(light);

let space = new THREE.Object3D();
light = new THREE.DirectionalLight( 0xFFFFFF, 0.6 ); // soft white light
light.position.set(0, 0, 30);
space.add( light );
scene.add(space);

//end of general scene

//Button creation, we give the function a string to be the caption of the butto
//the position, and two config json paramaters, one for the text material and other
//for the box material (both Phong material)
const boton= guiManager.createBoxButton('Control de luz',{x:0,y:10,z:0},
	{size:4, specular: 0x00AA00, shininess: 30},
	{specular: 0xAA00AA, shininess: 20});
scene.add(boton);

//slider construction function, this receive a position for the slider, two json cofig
//firs for the bar material and the second for the selection box material (both Phong material)
//and a json config for the size of the slider
const slider = guiManager.createSlider({x: 0, y: -5, z:0},{},{},{width:30, height: 3, length: 3});
scene.add(slider);


//Function for the mouse movement
function onDocumentMouseMove(event){
	event.preventDefault();
	//This function receive the event an the camera which is in use
	//return in case of intersection the objective of the inteserction of the event
	let objective = guiManager.verifyIntersect(event, camera);
	if(objective){
		switch (objective.object.name){
		case 'text':
		case 'boxText':
			//Receive an objective a scale any object inside it by 1.2 factor
			guiManager.bump(objective)
			break;
		}
	}else {
		//make reduce said objective scale in case of scenes with multiple elements
		//this should be moved to the previous switch in the default case
		guiManager.bumpStop();
	}
	
}

//Function for the mousedown event
function onMouseDown(event){
	//This function receive the event an the camera which is in use
	//return in case of intersection the objective of the inteserction of the event
	let objective = guiManager.verifyIntersect(event, camera);
	if (objective) {
		//desactivativate the controls
		cameraControls.enabled = false;
		if (objective.object.name == 'slider') {
			guiManager.dragStart = true;
			guiManager.dragSlider.push(objective.object, objective.object.parent);
		}
	}

}


function onMouseUp(event){
	cameraControls.enabled=true;
	guiManager.dragStart = false;
	guiManager.dragSlider.pop();
	guiManager.dragSlider.pop();
}


function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );

}
window.addEventListener( 'resize', onWindowResize, false );
window.addEventListener('mousemove', onDocumentMouseMove, false);
document.addEventListener('mousedown', onMouseDown, false);
document.addEventListener('mouseup', onMouseUp, false);
document.addEventListener('touchstart', onMouseDown, false);
document.addEventListener('touchend', onMouseUp, false);


//responsive function
function resizeRendererToDisplaySize(renderer) {
	const canvas = renderer.domElement;
	const pixelRatio = window.devicePixelRatio;
	const width  = canvas.clientWidth  * pixelRatio | 0;
	const height = canvas.clientHeight * pixelRatio | 0;
	const needResize = canvas.width !== width || canvas.height !== height;
	if (needResize) {
	  renderer.setSize(width, height, false);
	}
	return needResize;
}

function render() {
	
	const delta = clock.getDelta();
	const hasControlUpdated = cameraControls.update(delta);
	if(guiManager.dragStart){ 
		//Example of the value use
		let value = guiManager.moveSlide(delta, camera);
		space.rotation.y = value * Math.PI/180;
		console.log(value);
	}


	if ( hasControlUpdated ) {
		renderer.render( scene, camera );
	}

	

	if (resizeRendererToDisplaySize(renderer)){
			const canvas = renderer.domElement;
			camera.aspect = canvas.clientWidth / canvas.clientHeight;
			camera.updateProjectionMatrix();
		}
	renderer.render(scene, camera);

	requestAnimationFrame(render);
}
requestAnimationFrame(render);

