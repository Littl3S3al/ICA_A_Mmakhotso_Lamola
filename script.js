import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r119/build/three.module.js';
import {OrbitControls} from 'https://threejsfundamentals.org/threejs/resources/threejs/r119/examples/jsm/controls/OrbitControls.js';



// variables for event listeners
const beginBtn = document.querySelector('#btn-begin');
const overlay = document.querySelector('#overlay');
const threeJsWindow = document.querySelector('#three-js-container');
const popupWindow = document.querySelector('.popup-window');
const closeBtn = document.querySelector('#btn-close');

const audios = document.querySelectorAll('audio');

let currentObject;

// loader
const loadingElem = document.querySelector('#loading');
const progressBarElem = loadingElem.querySelector('.progressbar');

let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;

let orbiting = false;


// three.js functions
const main  = () => {
    const canvas = document.querySelector('#c');

    // renderer
    const renderer = new THREE.WebGLRenderer({canvas, antialias: true});
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // camera
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 100000 );
    camera.position.x = 0;
    camera.position.y = 0;
    camera.position.z = 0;


    // scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xFCE4EC  );
    scene.fog = new THREE.FogExp2( 0xFCE4EC  , 0.007 );

    

    // loaders
    const loadManager = new THREE.LoadingManager();
    const textureLoader = new THREE.TextureLoader(loadManager);

    
    const addPointLight = (shade, intense, parent, angle, far, top, distance) => {
        const color = shade;
        const intensity = intense;
        const light = new THREE.SpotLight(color, intensity);
        light.castShadow = true;
        light.position.set(0, top, 0);
        light.target.position.set(-4, 0, -4);
        light.penumbra = 1;
        light.angle = angle;
        light.far = far;
        light.distance = distance;
        parent.add(light);
        parent.add(light.target);
    }

    addPointLight(0xFFFFFF, 0.8, scene, 5, 500, 100, 1000);



    
    // orbit controls
    const controls = new OrbitControls( camera, canvas );
    // controls.addEventListener( 'change', render );
    controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 50;
    controls.maxDistance = 200;
    controls.maxPolarAngle = 90 * Math.PI/180;
    controls.minPolarAngle = 90 * Math.PI/180;

    
      

    // set up world
    const invisMaterial = new THREE.MeshPhongMaterial( { color: 0xffffff, flatShading: true, transparent: true, opacity: 0 } );

    const geometry = new THREE.CylinderBufferGeometry( 0, 20, 30, 4, 1 );
    


    const CenterOrb = new THREE.Mesh (geometry, invisMaterial)
    CenterOrb.position.x = 300;
    CenterOrb.position.y = 0;
    CenterOrb.position.z = 0;
    scene.add( CenterOrb );



    // sound beacons (pyramids)

    const reflectWorld = new THREE.CubeTextureLoader()
        .setPath( 'assets/soundReflection/' )
        .load( [ 'px.png', 'nx.png', 'py.png', 'ny.png', 'pz.png', 'nz.png' ] );
                    
    const reflectiveMaterial = new THREE.MeshBasicMaterial( { color: 'rgb(255,255,255)', envMap: reflectWorld} );

    let soundBeacons = [];

    for ( var i = 0; i < 4; i ++ ) {
        let pos = [
            {x: -200, z: -25}, {x: 250, z: -250}, {x: 200, z: 100}, {x: -250, z: 250}
        ]
        var mesh = new THREE.Mesh( geometry, reflectiveMaterial );
        mesh.position.x = pos[i].x;
        mesh.position.y = 30;
        mesh.position.z = pos[i].z;
        mesh.castShadow = true; //default is false
        mesh.receiveShadow = true;
        mesh.name = 'soundBeacon' + i;
        CenterOrb.add( mesh );
        soundBeacons.push(mesh);

    }

    let worldBeacons = [];
    const sphereGeometry = new THREE.SphereGeometry( 20, 32, 32 );
    const waterWorld = new THREE.CubeTextureLoader()
        .setPath( 'assets/worldReflection/' )
        .load( [ 'px.png', 'nx.png', 'py.png', 'ny.png', 'pz.png', 'nz.png' ] );
                    
    const waterMaterial = new THREE.MeshBasicMaterial( { color: 'rgb(255,255,255)', envMap: waterWorld, refractionRatio: 0.8} );
    waterMaterial.envMap.mapping = THREE.CubeRefractionMapping;

    for(var i = 0; i < 2; i ++){
        let pos = [
            {x: -250, z: -250}, {x: 100, z: -100}, {x: 250, z: 250}, {x: 10, z: 200}, {x: -170, z: 100}
        ];
        var mesh = new THREE.Mesh( sphereGeometry, waterMaterial );
        mesh.position.x = pos[i].x;
        mesh.position.z = pos[i].z;
        mesh.position.y = 20;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.name = 'worldBeacon' + i;
        CenterOrb.add(mesh);
        worldBeacons.push(mesh);

    }


    // set up ground plane

    const groundSize = 2500;
    const groundTexture = textureLoader.load('assets/bluepring.jpg');
    groundTexture.magFilter = THREE.NearestFilter;
    groundTexture.wrapS = THREE.RepeatWrapping;
    groundTexture.wrapT = THREE.RepeatWrapping;
    groundTexture.magFilter = THREE.NearestFilter;
    const repeats = groundSize / 100;
    groundTexture.repeat.set(repeats, repeats);

    const planeGeo = new THREE.PlaneBufferGeometry(groundSize, groundSize);
    const planeMat = new THREE.MeshPhongMaterial({map: groundTexture});

    const mapMesh = new THREE.Mesh(planeGeo, planeMat);
    mapMesh.receiveShadow = true;
    mapMesh.rotation.x = Math.PI * -.5;
    mapMesh.position.y = -10;

    
    

    loadManager.onLoad = () => {
        loadingElem.style.display = 'none';
        CenterOrb.add(mapMesh);
        
    };

    loadManager.onProgress = (urlOfLastItemLoaded, itemsLoaded, itemsTotal) => {
        const progress = itemsLoaded / itemsTotal*100;
        progressBarElem.style.width = progress + '%';
    };


    
  class PickHelper {
    constructor() {
      this.raycaster = new THREE.Raycaster();
      this.pickedObject = null;
      this.pickedObjectSavedColor = 0;
    }
    pick(normalizedPosition, scene, camera, time) {
      // restore the color if there is a picked object
      if (this.pickedObject) {
        this.pickedObject = undefined;
      }

      // cast a ray through the frustum
      this.raycaster.setFromCamera(normalizedPosition, camera);
      // get the list of objects the ray intersected
      const intersectedObjects = this.raycaster.intersectObjects(CenterOrb.children);
      if (intersectedObjects.length) {
        // pick the first object. It's the closest one
        this.pickedObject = intersectedObjects[0].object;
      }
    }
  }

  const pickPosition = {x: 0, y: 0};
  const pickHelper = new PickHelper();
  clearPickPosition();

    

    renderer.render( scene, camera );

    // resize function
    const onWindowResize = () => {

        windowHalfX = window.innerWidth / 2;
        windowHalfY = window.innerHeight / 2;
    
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    
        renderer.setSize( window.innerWidth, window.innerHeight );
    
    }

    const render = (time) => {

        let itemSelected = false;

        time *= 0.00005;

        window.addEventListener('resize', onWindowResize, false)

        CenterOrb.rotation.y = time;

        pickHelper.pick(pickPosition, scene, camera, time);
        
        if(pickHelper.pickedObject && !orbiting){
            if(pickHelper.pickedObject.name){
                currentObject = pickHelper.pickedObject.name;
                itemSelected = true;
                if(pickHelper.pickedObject.name.includes('sound')){
                    redColor(pickHelper.pickedObject, true);
                } else if(pickHelper.pickedObject.name.includes('world')){
                    blueColor(pickHelper.pickedObject, true);
                }
            }
        }

        soundBeacons.forEach(beacon => {
            beacon.rotation.y = time;
            if(!itemSelected){
                redColor(beacon, false);
            }
        });

        worldBeacons.forEach(beacon => {
            if(!itemSelected){
                blueColor(beacon, false);
            }
        })



        
        renderer.setPixelRatio( window.devicePixelRatio );
        // controls.update();  

        renderer.render(scene, camera);
        requestAnimationFrame(render);

        
    }

    requestAnimationFrame(render);
    controls.update();

    const redColor = (object, red) => {
        let g = object.material.color.g;
        let b = object.material.color.b;
        if( g < 1 && !red){ g += 0.05 };
        if( b < 1 && !red){ b += 0.05 };
        if( g > 0 && red){ g -= 0.05 };
        if( b > 0 && red){ b -= 0.05 };
        object.material.color.setRGB(1, g, b);
    }

    const blueColor = (object, blue) => {
        let r = object.material.color.r;
        let g = object.material.color.g;
        if( r < 1 && !blue){ r += 0.05 };
        if( g < 1 && !blue){ g += 0.01 };
        if( r > 0 && blue){ r -= 0.05 };
        if( g > 0.5 && blue){ g -= 0.01 };
        object.material.color.setRGB(r, g, 1);
    }

    function getCanvasRelativePosition(event) {
		const rect = canvas.getBoundingClientRect();
		return {
		x: (event.clientX - rect.left) * canvas.width  / rect.width,
		y: (event.clientY - rect.top ) * canvas.height / rect.height,
		};
	}

	function setPickPosition(event) {
		const pos = getCanvasRelativePosition(event);
		pickPosition.x = (pos.x /  canvas.width ) *  2 - 1;
        pickPosition.y = (pos.y / canvas.height) * -2 + 1;  // note we flip Y
	}

	
    controls.addEventListener('change', () => {

        orbiting = true;

    });

	function clearPickPosition() {
		// unlike the mouse which always has a position
		// if the user stops touching the screen we want
		// to stop picking. For now we just pick a value
		// unlikely to pick something
		pickPosition.x = -100000;
		pickPosition.y = -100000;
  }
  

    window.addEventListener('mousemove', setPickPosition);
	window.addEventListener('mouseout', clearPickPosition);
    window.addEventListener('mouseleave', clearPickPosition);
    window.addEventListener('mouseup', () => {
        orbiting = false;
    })


	window.addEventListener('touchstart', (event) => {
		// prevent the window from scrolling
		event.preventDefault();
        setPickPosition(event.touches[0]);
        checkForClick();
	}, {passive: false});

	window.addEventListener('touchmove', (event) => {
		setPickPosition(event.touches[0]);
	});

	window.addEventListener('touchend', () => {
        clearPickPosition();
        orbiting = false;
	})
}


// event listeners
beginBtn.addEventListener('click', () => {
    overlay.style.display = 'none';
    threeJsWindow.style.display = 'block';
    main();
});

closeBtn.addEventListener('click', () => {
    popupWindow.classList.add('hide');
    setTimeout(() => {
        popupWindow.style.display = 'none';
    }, 1000);
})


// functions
window.addEventListener('mousedown', () => {
    checkForClick();
});

const checkForClick = () => {
    if(!orbiting && currentObject){
        var lastChar = currentObject[currentObject.length -1];
        if(currentObject.includes('soundBeacon')){playSound(lastChar);}
    }

    currentObject = undefined;
}

const playSound = (number) => {
    let no = parseInt(number);
    audios.forEach(audio => { audio.pause(); })
    audios[no].play();
}