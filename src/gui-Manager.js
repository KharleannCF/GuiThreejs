import * as THREE from 'three';
//Array for the elements of the slider
export let dragSlider = [];
//Elements that can be clicked or changed via mouse
const interactiveElements = [];
//Boolean for the dragEvent
let dragStart = false;

//vector for the mouse position in the screen
let mouse = new THREE.Vector2(1,1);
//The element that have been intersected by the mouse
let INTERSECTED;
//caster for the mouse
let raycaster = new THREE.Raycaster();

let helper = {
    isDefined : function(conf) {
        return (conf !== null && conf !== undefined);
    },
    findByName  : function(elem, name) {
        return elem.getObjectByName(name);
    }
};


//Receive a config JSON, put the initial value of every mayor option
//provided by ThreeJS for the MeshPhongMaterial constructor
//in case there was a value just put it back inside
//Also put a random color in case there was no color defined
function verifyPhongMaterial(conf){
	if (!helper.isDefined(conf.color)) {
	let color = new THREE.Color(0xFFFFFF);
	color.setHex(Math.random() * 0xFFFFFF);
	conf.color = color;
	} else {
		conf.color = conf.color;
	}
	conf.emissive = (helper.isDefined(conf.emissive)) ? conf.emissive : 0x000000;
	conf.emissiveIntensity = (helper.isDefined(conf.emissiveIntensity)) ? conf.emissiveIntensity : 1;
	conf.envMap = (helper.isDefined(conf.envMap)) ? conf.envMap : null;
	conf.reflectivity = (helper.isDefined(conf.reflectivity)) ? conf.reflectivity: 1;
	conf.refractionRatio = (helper.isDefined(conf.refractionRatio)) ? conf.refractionRatio: 0.98;
	conf.specular = (helper.isDefined(conf.specular)) ? conf.specular : 0x111111;
	conf.shininess = (helper.isDefined(conf.shininess)) ? conf.shininess : 30;
	conf.opacity = (helper.isDefined(conf.opacity)) ? conf.opacity : 1;
	conf.transparent = (helper.isDefined(conf.transparent)) ? conf.transparent : false;
	return conf;
}

//Receive a JSON conf for a boxGeometry, put 1 in every parameter of the contructor
function verifyBoxGeometry(conf){
	conf.width = helper.isDefined(conf.width) ? conf.width : 1;
	conf.height = helper.isDefined(conf.height) ? conf.height : 1;
	conf.length = helper.isDefined(conf.length) ? conf.length : 1;
	return conf;
}


//Receive an event and a camera and change the mouse value
//in case there is an intersection with a interactiveElement
//return said intersection event
export function verifyIntersect(event, camera){
	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
	raycaster.setFromCamera(mouse,camera);
	let intersects = raycaster.intersectObjects(interactiveElements);
	if (intersects.length > 0) {
		return intersects[0];
	}else {
		return null	
	}
}



//Creation of the boxButton, receive a string to put inside the box
//the position inside a vector and 2 Json config for the materials of the text and the box
//this return an object 3d with the box and text inside
export function createBoxButton(text, position, textConf, conf){
position = (helper.isDefined(position)) ? position : []
const button = new THREE.Object3D();
createTextBox(button, text,  textConf, conf);

button.position.copy(position);
return button;
}

//for performance reasons I decided to promisify the loader of the font and the creation of the box
//this receive the parent element of the box and the text an put them inside
function createTextBox(parent, text, textConf, conf){
	const loader = new THREE.FontLoader();
	// promisify font loading
	function loadFont(url) {
	  return new Promise((resolve, reject) => {
	    loader.load(url, resolve, undefined, reject);
	  });
	}
	async function doit(parent, text, textConf, conf) {
		textConf = helper.isDefined(textConf) ? textConf : {};
		textConf = verifyPhongMaterial(textConf);
		textConf.size = (helper.isDefined(textConf.size)) ? textConf.size : 1;
		const font = await loadFont('resources/fonts/font.typeface.json');
		const textGeometry = new THREE.TextGeometry(text, {
			font: font,
			size: textConf.size,
			height: 0.3,
			curveSegments: 12
		});
		const textMaterial = new THREE.MeshPhongMaterial({color:textConf.color,
			emissive: textConf.emissive,
			emissiveIntensity: textConf.emissiveIntensity,
			envMap: textConf.envMap,
			reflectivity: textConf.reflectivity,
			refractionRatio: textConf.refractionRatio,
			specular: textConf.specular,
			shininess: textConf.shininess,
			opacity: textConf.opacity,
			transparent: textConf.transparent
		});
		const mesh = new THREE.Mesh(textGeometry, textMaterial);
		mesh.geometry.computeBoundingBox();
		const width = mesh.geometry.boundingBox.max.x - mesh.geometry.boundingBox.min.x;
		const height = mesh.geometry.boundingBox.max.y - mesh.geometry.boundingBox.min.y;
		const depth = mesh.geometry.boundingBox.max.z - mesh.geometry.boundingBox.min.z;
		mesh.position.set(-width/2, -height/2.75, depth/2);
		mesh.name = 'text';

		conf = helper.isDefined(conf) ? conf : {};
		conf = verifyPhongMaterial(conf);
		const boxMaterial = new THREE.MeshPhongMaterial({color: conf.color,
			emissive: conf.emissive,
			emissiveIntensity: conf.emissiveIntensity,
			envMap: conf.envMap,
			reflectivity: conf.reflectivity,
			refractionRatio: conf.refractionRatio,
			specular: conf.specular,
			shininess: conf.shininess,
			opacity: conf.opacity,
			transparent: conf.transparent
		});
		const boxGeometry = new THREE.BoxGeometry(width*1.2,height*1.3,depth+0.2);
		const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
		boxMesh.name = 'boxText'

		parent.add(boxMesh);
		parent.add(mesh);
 		interactiveElements.push(boxMesh);
 		interactiveElements.push(mesh);
  }
	doit(parent, text, textConf, conf);
}

//this function create the slider, receive a position for the slider
//3 conf Json, two for the materials and one for the size
export function createSlider(position, conf, controlConf, geometryConf){
	conf = helper.isDefined(conf) ? conf : {};
	controlConf = helper.isDefined(controlConf) ? controlConf : {};
	geometryConf = helper.isDefined(geometryConf) ? geometryConf : {};
	conf = verifyPhongMaterial(conf);
	controlConf = verifyPhongMaterial(controlConf);
	geometryConf = verifyBoxGeometry(geometryConf);

	let mainBoxGeo = new THREE.BoxGeometry(geometryConf.width, geometryConf.height, geometryConf.length);
	let mainBoxMat = new THREE.MeshPhongMaterial({color: conf.color,
			emissive: conf.emissive,
			emissiveIntensity: conf.emissiveIntensity,
			envMap: conf.envMap,
			reflectivity: conf.reflectivity,
			refractionRatio: conf.refractionRatio,
			specular: conf.specular,
			shininess: conf.shininess,
			opacity: conf.opacity,
			transparent: conf.transparent
		});
	let mainBox = new THREE.Mesh(mainBoxGeo, mainBoxMat);
	let sliderBoxGeo = new THREE.BoxGeometry(geometryConf.width*0.025, geometryConf.height*1.3, geometryConf.length*1.4);
	let sliderBoxMat = new THREE.MeshPhongMaterial({color: controlConf.color,
			emissive: controlConf.emissive,
			emissiveIntensity: controlConf.emissiveIntensity,
			envMap: controlConf.envMap,
			reflectivity: controlConf.reflectivity,
			refractionRatio: controlConf.refractionRatio,
			specular: controlConf.specular,
			shininess: controlConf.shininess,
			opacity: controlConf.opacity,
			transparent: controlConf.transparent
		});
	let sliderBox = new THREE.Mesh(sliderBoxGeo, sliderBoxMat);
	sliderBox.position.set(-geometryConf.width/2,0,0);
	sliderBox.name = 'slider';
	sliderBox.value = 0;
	interactiveElements.push(sliderBox);
	interactiveElements.push(mainBox);
	mainBox.add(sliderBox);

	mainBox.geometry.computeBoundingBox();
	mainBox.Max = mainBox.geometry.boundingBox.max.x;
	mainBox.Min = mainBox.geometry.boundingBox.min.x;
	mainBox.name = 'bar';
	mainBox.position.copy(position);
	return mainBox;
}


//receive an objective, and scale it parent by 1.2 factor
//only in case its the same objective as before
export function bump(objective){
	if (INTERSECTED != objective ) {
		INTERSECTED =  objective.object.parent;
		if (INTERSECTED) INTERSECTED.scale.set(1.1,1.1,1);
		INTERSECTED.scale.set(1.2,1.2,1);
	}else{
		if (INTERSECTED) INTERSECTED.scale.set(1,1,1)
		INTERSECTED = null;
	}
}

//if intersected is defined or not null set it
//to normal and nullify it
export function bumpStop(){
	if (INTERSECTED){
		INTERSECTED.scale.set(1,1,1);
		INTERSECTED = null;
	}
}

//Receive a delta and a camera and move a slide according to mouse position in the world
export function moveSlide(delta, camera){
	//basic speed for the slider box
	let dragspeed = 10;
	let slide = dragSlider[0];
	let bar = dragSlider[1];
	//this section is to get the mouse pointer in the scene
	let vector = new THREE.Vector3(mouse.x,mouse.y,0.5);
	vector.unproject(camera);
	let dir = vector.sub(camera.position).normalize();
	let distance = -camera.position.z/dir.z;
	let pos = camera.position.clone().add(dir.multiplyScalar(distance));
	pos.x -= bar.position.x;
	//actual position of the slider
	let posAct =  slide.position.x;
	let dis = Math.pow((pos.x - posAct)*(pos.x - posAct), 1/2);
	if( !((posAct < bar.Min && posAct > pos.x) || ( posAct < pos.x && posAct > bar.Max)) ){
		if(dis < 0.009 ) dragspeed = 0;
		if(dis > 0.01) dragspeed = dragspeed/100;;
		if(dis > 0.05) dragspeed = dragspeed*100;
		if(dis > 5) dragspeed = dragspeed*2;
		if(dis > 10) dragspeed = dragspeed*3;
		if (posAct < pos.x) {
			slide.position.x += dragspeed*delta;	
		}else if (posAct > pos.x) {
			slide.position.x -= dragspeed*delta
		}
		//value of the slide according to it position in the bar
		slide.value = 100*slide.position.x/(bar.Max-bar.Min) + 50;
		if (slide.value > 100) slide.value = 100;
		if (slide.value < 0) slide.value = 0;
	}
	return slide.value;
}
