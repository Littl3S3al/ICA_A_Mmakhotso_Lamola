import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r119/build/three.module.js';
import {OrbitControls} from 'https://threejsfundamentals.org/threejs/resources/threejs/r119/examples/jsm/controls/OrbitControls.js';
import { PositionalAudioHelper } from 'https://threejsfundamentals.org/threejs/resources/threejs/r119/examples/jsm/helpers/PositionalAudioHelper.js';

import {secondary} from './worldScript.js';



// variables for event listeners
const beginBtn = document.querySelector('#btn-begin');
const overlay = document.querySelector('#overlay');
const threeJsWindow = document.querySelector('#three-js-container');
const popupWindow = document.querySelector('.popup-window');
const closeBtn = document.querySelector('#btn-close');

const btnForwards = document.querySelector('#forwards');
const btnBack = document.querySelector('#backwards');
let currentAngle = 0;
let actualAngle = 0;

const audios = [
    'assets/sounds/bensound-cute.mp3',
    'assets/sounds/bensound-hey.mp3',
    'assets/sounds/bensound-relaxing.mp3',
    'assets/sounds/bensound-ukulele.mp3'
];
const loadedAudios = [];
const whispering = document.querySelector('.audio-overall')

let currentObject;

// loader
const loadingElem = document.querySelector('#loading');
const progressBarElem = loadingElem.querySelector('.progressbar');

let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;

let orbiting = false;
let viewing = false;


const worldMaps = [
    'assets/soundReflection/', 
    'assets/soundReflection/', 
    'assets/soundReflection/', 
    'assets/soundReflection/', 
    'assets/soundReflection/'
]
let loadedWorlds = [];
const worldSounds = document.querySelectorAll('.world-audio');



var DAMPING = 0.03;
var DRAG = 1 - DAMPING;
var MASS = 0.1;
var restDistance = 2;

var xSegs = 10;
var ySegs = 10;

var clothFunction = plane( restDistance * xSegs, restDistance * ySegs );

var cloth = new Cloth( xSegs, ySegs );

var GRAVITY = 500;
var gravity = new THREE.Vector3( 0, - GRAVITY, 0 ).multiplyScalar( MASS );


var TIMESTEP = 18 / 1000;
var TIMESTEP_SQ = TIMESTEP * TIMESTEP;


var windForce = new THREE.Vector3( 0, 0, 0 );

var tmpForce = new THREE.Vector3();


function plane( width, height ) {

    return function ( u, v, target ) {

        var x = ( u - 0.5 ) * width;
        var y = ( v + 0.5 ) * height;
        var z = 0;

        target.set( x, y, z );

    };

}

function Particle( x, y, z, mass ) {

    this.position = new THREE.Vector3();
    this.previous = new THREE.Vector3();
    this.original = new THREE.Vector3();
    this.a = new THREE.Vector3( 0, 0, 0 ); // acceleration
    this.mass = mass;
    this.invMass = 1 / mass;
    this.tmp = new THREE.Vector3();
    this.tmp2 = new THREE.Vector3();

    // init

    clothFunction( x, y, this.position ); // position
    clothFunction( x, y, this.previous ); // previous
    clothFunction( x, y, this.original );

}

// Force -> Acceleration
Particle.prototype.addForce = function ( force ) {

    this.a.add(
        this.tmp2.copy( force ).multiplyScalar( this.invMass )
    );

};

// Performs Verlet integration
Particle.prototype.integrate = function ( timesq ) {

    var newPos = this.tmp.subVectors( this.position, this.previous );
    newPos.multiplyScalar( DRAG ).add( this.position );
    newPos.add( this.a.multiplyScalar( timesq ) );

    this.tmp = this.previous;
    this.previous = this.position;
    this.position = newPos;

    this.a.set( 0, 0, 0 );

};

var diff = new THREE.Vector3();

function satisfyConstraints( p1, p2, distance ) {

    diff.subVectors( p2.position, p1.position );
    var currentDist = diff.length();
    if ( currentDist === 0 ) return; // prevents division by 0
    var correction = diff.multiplyScalar( 1 - distance / currentDist );
    var correctionHalf = correction.multiplyScalar( 0.5 );
    p1.position.add( correctionHalf );
    p2.position.sub( correctionHalf );

}

function Cloth( w, h ) {

    w = w || 10;
    h = h || 10;
    this.w = w;
    this.h = h;

    var particles = [];
    var constraints = [];

    var u, v;

    // Create particles
    for ( v = 0; v <= h; v ++ ) {

        for ( u = 0; u <= w; u ++ ) {

            particles.push(
                new Particle( u / w, v / h, 0, MASS )
            );

        }

    }

    // Structural

    for ( v = 0; v < h; v ++ ) {

        for ( u = 0; u < w; u ++ ) {

            constraints.push( [
                particles[ index( u, v ) ],
                particles[ index( u, v + 1 ) ],
                restDistance
            ] );

            constraints.push( [
                particles[ index( u, v ) ],
                particles[ index( u + 1, v ) ],
                restDistance
            ] );

        }

    }

    for ( u = w, v = 0; v < h; v ++ ) {

        constraints.push( [
            particles[ index( u, v ) ],
            particles[ index( u, v + 1 ) ],
            restDistance

        ] );

    }

    for ( v = h, u = 0; u < w; u ++ ) {

        constraints.push( [
            particles[ index( u, v ) ],
            particles[ index( u + 1, v ) ],
            restDistance
        ] );

    }



    this.particles = particles;
    this.constraints = constraints;

    function index( u, v ) {

        return u + v * ( w + 1 );

    }

    this.index = index;

}

function simulate( now ) {

    var windStrength = Math.cos( now / 7000 )  ;

    windForce.set( Math.sin( now / 2000 ), Math.cos( now / 3000 ), Math.sin( now / 1000 ) );
    windForce.normalize();
    windForce.multiplyScalar( windStrength );

    var i, j, il, particles, particle, constraints, constraint;

    // Aerodynamics forces
        var indx;
        var normal = new THREE.Vector3();
        var indices = clothGeometry.index;
        var normals = clothGeometry.attributes.normal;

        particles = cloth.particles;

        for ( i = 0, il = indices.count; i < il; i += 3 ) {

            for ( j = 0; j < 3; j ++ ) {

                indx = indices.getX( i + j );
                normal.fromBufferAttribute( normals, indx );
                tmpForce.copy( normal ).normalize().multiplyScalar( normal.dot( windForce ) );
                particles[ indx ].addForce( tmpForce );

            }

        }

    

    for ( particles = cloth.particles, i = 0, il = particles.length; i < il; i ++ ) {

        particle = particles[ i ];
        particle.addForce( gravity );

        particle.integrate( TIMESTEP_SQ );

    }

    // Start Constraints

    constraints = cloth.constraints;
    il = constraints.length;

    for ( i = 0; i < il; i ++ ) {

        constraint = constraints[ i ];
        satisfyConstraints( constraint[ 0 ], constraint[ 1 ], constraint[ 2 ] );

    }




    // Pin Constraints

    for ( i = 0, il = pins.length; i < il; i ++ ) {

        var xy = pins[ i ];
        var p = particles[ xy ];
        p.position.copy( p.original );
        p.previous.copy( p.original );

    }


}

/* testing cloth simulation */

var pinsFormation = [];
var pins = [ 6 ];

pinsFormation.push( pins );

pins = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ];
pinsFormation.push( pins );

pins = [ 0 ];
pinsFormation.push( pins );

pins = []; // cut the rope ;)
pinsFormation.push( pins );

pins = [ 0, cloth.w ]; // classic 2 pins
pinsFormation.push( pins );

pins = pinsFormation[ 1 ];


var clothGeometry;



// three.js functions
const main  = () => {
    const canvas = document.querySelector('#c');

    // renderer
    const renderer = new THREE.WebGLRenderer({canvas, antialias: true});
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // bring in audio listener
    const listener = new THREE.AudioListener();
    const audioLoader = new THREE.AudioLoader();

    // camera
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 100000 );
    camera.position.x = 0;
    camera.position.y = 130;
    camera.position.z = 50;


    // scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xAED6F1  );
    scene.fog = new THREE.FogExp2( 0xAED6F1   , 0.003 );

    

    // loaders
    const loadManager = new THREE.LoadingManager();
    const textureLoader = new THREE.TextureLoader(loadManager);
    const cubeTextureLoader = new THREE.CubeTextureLoader(loadManager);

   worldMaps.forEach(map => {
    const world = cubeTextureLoader
    .setPath( map )
    .load( [ 'px.png', 'nx.png', 'py.png', 'ny.png', 'pz.png', 'nz.png' ] );
    loadedWorlds.push(world);
   })

    
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

    addPointLight(0xFFFFFF, 0.8, scene, 1, 500, 100, 1000);

    scene.add( new THREE.AmbientLight( 0xffffff, 0.5 ) );



    
    // orbit controls
    const controls = new OrbitControls( camera, canvas );
    // controls.addEventListener( 'change', render );
    controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 20;
    controls.maxDistance = 200;
    controls.minPolarAngle = 0 * Math.PI/180;
    controls.maxPolarAngle = 80 * Math.PI/180;
    controls.enableKeys = false;

    
      

    // set up world
    const invisMaterial = new THREE.MeshPhongMaterial( { color: 0xffffff, flatShading: true, transparent: true, opacity: 0 } );

    const geometry = new THREE.CylinderBufferGeometry( 0, 10, 10, 3, 1 );
    


    const CenterOrb = new THREE.Mesh (geometry, invisMaterial)
    CenterOrb.position.x = 200;
    CenterOrb.position.y = 0;
    CenterOrb.position.z = 0;
    scene.add( CenterOrb );



    // sound beacons (pyramids)

    const reflectWorld = cubeTextureLoader
        .setPath( 'assets/soundReflection/' )
        .load( [ 'px.png', 'nx.png', 'py.png', 'ny.png', 'pz.png', 'nz.png' ] );
                    
    
    let soundBeacons = [];

    for ( var i = 0; i < 4; i ++ ) {
        const reflectiveMaterial = new THREE.MeshBasicMaterial( { color: 'rgb(255,255,255)', envMap: reflectWorld} );
        let pos = [
            {x: -110, z: 50}, {x: 0, z: -280}, {x: 160, z: -50}, {x: -50, z: 250}
        ]
        var mesh = new THREE.Mesh( geometry, reflectiveMaterial );
        mesh.position.x = pos[i].x;
        mesh.position.y = 0.5;
        mesh.position.z = pos[i].z;
        mesh.castShadow = true; //default is false
        mesh.receiveShadow = true;
        mesh.name = 'soundBeacon' + i;
        soundBeacons.push(mesh);

        const sound = new THREE.PositionalAudio( listener );
        audioLoader.load( audios[i], function ( buffer ) {

            sound.setBuffer( buffer );
            sound.setRefDistance( 2 );

        } );
        loadedAudios.push(sound);
        mesh.add( sound );

    }


    // world beacons

    let worldBeacons = [];
    const sphereGeometry = new THREE.SphereGeometry( 6, 32, 32 );
    const waterWorld = cubeTextureLoader
        .setPath( 'assets/worldReflection/' )
        .load( [ 'px.png', 'px.png', 'px.png', 'px.png', 'px.png', 'px.png' ] );
                    
    

    for(var i = 0; i < 5; i ++){
        const waterMaterial = new THREE.MeshBasicMaterial( { color: 'rgb(255,255,255)', envMap: waterWorld, refractionRatio: 0.8} );
        waterMaterial.envMap.mapping = THREE.CubeRefractionMapping;

        let pos = [
            {x: -220, z: -30}, {x: -50, z: -150}, {x: 250, z: -20}, {x: 170, z: 50}, {x: 0, z: 180}
        ];
        var mesh = new THREE.Mesh( sphereGeometry, waterMaterial );
        mesh.position.x = pos[i].x;
        mesh.position.z = pos[i].z;
        mesh.position.y = -4;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.name = 'worldBeacon' + i;
        worldBeacons.push(mesh);

    }


    // portfolio beacons
    let portfolioBeacons = [];

    // cloth parent
    var planeGeometry = new THREE.PlaneBufferGeometry( 20, 30);
    var planeMaterial = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide, transparent: true, opacity: 0});

    // cloth
    // cloth material

    var clothTexture = textureLoader.load( 'assets/pattern.png' );
    clothTexture.anisotropy = 16;

    

    // cloth geometry

    clothGeometry = new THREE.ParametricBufferGeometry( clothFunction, cloth.w, cloth.h );

    // cloth mesh

   for(var i = 0; i < 3; i ++){

    var clothMaterial = new THREE.MeshLambertMaterial( {
        color: 'rgb(255, 255, 255)',
        map: clothTexture,
        side: THREE.DoubleSide,
        alphaTest: 0.5
    } );

        let pos = [
            {x: -130, z: -40}, {x: 30, z: -170}, {x: 30, z: 280}
        ]

        var plane = new THREE.Mesh( planeGeometry, planeMaterial );
        plane.position.set( pos[i].x, 5, pos[i].z );
        CenterOrb.add( plane );
        plane.name = 'portfolioBeacon' + i;

        var object = new THREE.Mesh( clothGeometry, clothMaterial );
        object.position.set(0, 0, 0);
        object.castShadow = true;
        

        object.customDepthMaterial = new THREE.MeshDepthMaterial( {
            depthPacking: THREE.RGBADepthPacking,
            map: clothTexture,
            alphaTest: 1
        } );
        plane.add(object);

        portfolioBeacons.push(plane);
   }



    // set up ground plane

    const groundSize = 1800;
    const groundTexture = textureLoader.load('assets/bluepring.jpg');
    groundTexture.magFilter = THREE.NearestFilter;
    groundTexture.wrapS = THREE.RepeatWrapping;
    groundTexture.wrapT = THREE.RepeatWrapping;
    groundTexture.magFilter = THREE.NearestFilter;
    const repeats = groundSize / 200;
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
        soundBeacons.forEach(beacon => {
            CenterOrb.add(beacon);
        });
        worldBeacons.forEach(beacon => {
            CenterOrb.add(beacon);
        })
        
    };

    loadManager.onProgress = (urlOfLastItemLoaded, itemsLoaded, itemsTotal) => {
        const progress = itemsLoaded / itemsTotal*100;
        progressBarElem.style.width = progress + '%';
    };


    
  class PickHelper {
    constructor() {
      this.raycaster = new THREE.Raycaster();
      this.raycaster.far = 300;
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
        currentObject = undefined;

        let difference = actualAngle - currentAngle;
        actualAngle -= difference/100;
        CenterOrb.rotation.y = actualAngle;
        


        if(!viewing){
            let itemSelected = false;

            time *= 0.0001;

            window.addEventListener('resize', onWindowResize, false)

           


            pickHelper.pick(pickPosition, scene, camera, time);
            
            if(pickHelper.pickedObject && !orbiting){
                if(pickHelper.pickedObject.name){
                    currentObject = pickHelper.pickedObject.name;
                    itemSelected = true;
                    if(pickHelper.pickedObject.name.includes('sound')){
                        pinkColor(pickHelper.pickedObject, true);
                    } else if(pickHelper.pickedObject.name.includes('world')){
                        pinkColor(pickHelper.pickedObject, true);
                    } else if(pickHelper.pickedObject.name.includes('portfolio')){
                        pinkColor(pickHelper.pickedObject.children[0], true)
                    }
                }
            }

            soundBeacons.forEach(beacon => {
                beacon.rotation.y = -time;
                if(!itemSelected){
                    pinkColor(beacon, false);
                }
            });

            worldBeacons.forEach(beacon => {
                if(!itemSelected){
                    pinkColor(beacon, false);
                }
            })

            portfolioBeacons.forEach(beacon => {
                if(!itemSelected){
                    pinkColor(beacon.children[0], false);
                }
            })



            
            renderer.setPixelRatio( window.devicePixelRatio );
            renderer.render(scene, camera);
        }
        requestAnimationFrame(render);


        
    }

    function animate( now ) {
            requestAnimationFrame( animate );
            simulate( now );
            

            var p = cloth.particles;

            for ( var i = 0, il = p.length; i < il; i ++ ) {

                var v = p[ i ].position;

                clothGeometry.attributes.position.setXYZ( i, v.x, v.y, v.z );

            }

            clothGeometry.attributes.position.needsUpdate = true;

            clothGeometry.computeVertexNormals();

    }

    animate(0);

    

    requestAnimationFrame(render);
    controls.update();

    const pinkColor = (object, blue) => {
        let g = object.material.color.g;
        if( g < 1 && !blue){ g += 0.005 };
        if( g > 0.5 && blue){ g -= 0.005 };
        object.material.color.setRGB(1, g, 1);
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
        checkForClick();
	});

	window.addEventListener('touchend', () => {
        clearPickPosition();
        orbiting = false;
        checkForClick();
	})
}


// event listeners
beginBtn.addEventListener('click', () => {
    overlay.style.display = 'none';
    threeJsWindow.style.display = 'block';
    whispering.play();
    whispering.volume = 0.05;
    main();
});

beginBtn.addEventListener('touchend', () => {
    overlay.style.display = 'none';
    threeJsWindow.style.display = 'block';
    main();
});


// functions
window.addEventListener('mouseup', () => {
    checkForClick();
});

const checkForClick = () => {
    if(!orbiting &&!viewing && currentObject){
        var lastChar = currentObject[currentObject.length -1];
        if(currentObject.includes('soundBeacon')){playSound(lastChar);}
        else if(currentObject.includes('portfolio')){openPortfolio(lastChar)}
        else if(currentObject.includes('world')){openWorld(lastChar)}
    }

    currentObject = undefined;
}

const playSound = (number) => {
    let no = parseInt(number);
    loadedAudios[no].play();
}

const portfolios = [
    'https://drive.google.com/file/d/14Oh6MJ-kmLNmfF0H5RRSanfXb5XiiDrx/preview',
    'https://drive.google.com/file/d/14Oh6MJ-kmLNmfF0H5RRSanfXb5XiiDrx/preview',
    'https://drive.google.com/file/d/14Oh6MJ-kmLNmfF0H5RRSanfXb5XiiDrx/preview'
]
const openPortfolio = (number) => {
    openWindow();
    const iframe = popupWindow.querySelector('iframe');
    iframe.classList.remove('d-none');
    iframe.src = portfolios[number];
};


const openWorld = (number) => {
    const newCanvas = popupWindow.querySelector('#d');
    newCanvas.style.display = 'block';
    openWindow();
    secondary(loadedWorlds[number]);
    worldSounds[number].currentTime = 0;
    worldSounds[number].play();

}



closeBtn.addEventListener('click', () => {
    closeWindow();
})
closeBtn.addEventListener('touchstart', () => {
    closeWindow();
})

function closeWindow() {
    popupWindow.style.opacity = 0;
    setTimeout(() => {
        popupWindow.style.zIndex = -10;
    }, 1200)
    viewing = false;
    const iframe = popupWindow.querySelector('iframe');
    iframe.classList.add('d-none');
    const newCanvas = popupWindow.querySelector('#d');
    newCanvas.style.display = 'none';
    whispering.play();
    loadedAudios.forEach(audio => {
        audio.setVolume(1)
    });
    worldSounds.forEach(sound => {
        sound.pause();
    })
}
function openWindow(){
    popupWindow.style.opacity = 1;
    popupWindow.style.zIndex = 100;
    viewing = true;
    whispering.pause();
    loadedAudios.forEach(audio => {
        audio.setVolume(0)
    });
}

btnForwards.addEventListener('click', () => {
    currentAngle += 90 * Math.PI/180;
});
btnBack.addEventListener('click', () => {
    currentAngle -= 90 * Math.PI/180;
});
btnForwards.addEventListener('touchend', () => {
    currentAngle += 90 * Math.PI/180;
});
btnBack.addEventListener('touchend', () => {
    currentAngle -= 90 * Math.PI/180;
});