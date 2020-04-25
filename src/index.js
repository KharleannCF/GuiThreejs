//import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
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
let interactiveElements = guiManager.interactiveElements;
let dragSlider = [];
let dragStart = false;
let dragspeed = 5;

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




const mesh= guiManager.createBoxButton('Tornasol',{x:0,y:10,z:0},
	{size:4, specular: 0x00AA00, shininess: 30},
	{specular: 0xAA00AA, shininess: 20});
scene.add(mesh);

const slider = guiManager.createSlider(0,{},{},{width:30, height: 3, length: 3});
scene.add(slider);


let bump = function(objective){
	if (INTERSECTED != objective ) {
		INTERSECTED =  objective.object.parent;
		if (INTERSECTED) INTERSECTED.scale.set(1.1,1.1,1);
		INTERSECTED.scale.set(1.2,1.2,1);
	}else{
		if (INTERSECTED) INTERSECTED.scale.set(1,1,1)
		INTERSECTED = null;
	}


}
let bumpStop = function(){
	if (INTERSECTED){
		INTERSECTED.scale.set(1,1,1);
		INTERSECTED = null;
	}
}

let moveSlide = function(delta){
	let slide = dragSlider[0];
	let bar = dragSlider[1];
	let vector = new THREE.Vector3(mouse.x,mouse.y,0.5);
	vector.unproject(camera);
	let dir = vector.sub(camera.position).normalize();
	let distance = -camera.position.z/dir.z;
	let pos = camera.position.clone().add(dir.multiplyScalar(distance));
	let posAct = slide.position.x;
	let dis = Math.pow((pos.x - posAct)*(pos.x - posAct), 1/2);
	if( !((posAct < bar.Min && posAct > pos.x) || ( posAct < pos.x && posAct > bar.Max)) ){
		if(dis > 0.001 ) dragspeed = 0;
		if(dis > 0.05) dragspeed = 5;
		if(dis > 10) dragspeed = 10;
		if (posAct < pos.x) {
			slide.position.x = posAct + dragspeed*delta;	
		}else if (posAct > pos.x) {
			slide.position.x =	posAct - dragspeed*delta
		}
		slide.value = 100*slide.position.x/(bar.Max-bar.Min) + 50;
		if (slide.value > 100) slide.value = 100;
		if (slide.value < 0) slide.value = 0;
	}
	space.rotation.y = slide.value * Math.PI/180;
	console.log(slide.value);
}
//selector.position.x = (posAct < slider.Max) ? posAct + 4*clock.getDelta() : posAct; 
//selector.position.x = (posAct > slider.Min) ? posAct - 4*clock.getDelta() : posAct; 


function onDocumentMouseMove(event){
	event.preventDefault();
	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
	let objective = verifyIntersect()
	if(objective){
		switch (objective.object.name){
		case 'text':
		case 'boxText':
			bump(objective)
			break;
		case 'slider':
		case 'bar':
			break;
		}
	}else {
		bumpStop();
	}
	
}


		
function onMouseDown(event){
	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
	let objective = verifyIntersect();
	if (objective) {
		cameraControls.enabled = false;
		if (objective.object.name == 'slider') {
			dragStart = true;
			dragSlider.push(objective.object, objective.object.parent);
		}
	}

}



function onMouseUp(event){
	cameraControls.enabled=true;
	dragStart = false;
	dragSlider.pop();
	dragSlider.pop();
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

let mouse = new THREE.Vector2(1,1);
let INTERSECTED;
let raycaster = new THREE.Raycaster();

let verifyIntersect =  function (){
	raycaster.setFromCamera(mouse,camera);
	let intersects = raycaster.intersectObjects(interactiveElements);
	if (intersects.length > 0) {
		return intersects[0];
	}else {
		return null	
	}
}

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
	if(dragStart) moveSlide(delta);


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

