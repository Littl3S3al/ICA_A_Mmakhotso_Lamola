import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r119/build/three.module.js';
import {OrbitControls} from 'https://threejsfundamentals.org/threejs/resources/threejs/r119/examples/jsm/controls/OrbitControls.js';
import {GUI} from 'https://threejsfundamentals.org/threejs/../3rdparty/dat.gui.module.js';



// variables for event listeners
const beginBtn = document.querySelector('#btn-begin');
const overlay = document.querySelector('#overlay');
const threeJsWindow = document.querySelector('#three-js-container');
const popupWindow = document.querySelector('.popup-window');
const closeBtn = document.querySelector('#btn-close');

// loader
const loadingElem = document.querySelector('#loading');
const progressBarElem = loadingElem.querySelector('.progressbar');

let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;

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
    scene.background = new THREE.Color( 0xffffff);
    scene.fog = new THREE.FogExp2( 0xFFFFFF  , 0.004 );

    

    // loaders
    const loadManager = new THREE.LoadingManager();
    const textureLoader = new THREE.TextureLoader(loadManager);

    
      {
        const color = 0xFFFFFF;
        const intensity = 0.8;
        const light = new THREE.SpotLight(color, intensity);
        light.castShadow = true;
        light.position.set(0, 100, 0);
        light.target.position.set(-4, 0, -4);
        light.penumbra = 1;
        light.angle = 10;
        scene.add(light);
        scene.add(light.target);
    }



    
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
    const material = new THREE.MeshPhongMaterial( { color: 0xffffff, flatShading: true } );


    const CenterOrb = new THREE.Mesh (geometry, invisMaterial)
    CenterOrb.position.x = 600;
    CenterOrb.position.y = 0;
    CenterOrb.position.z = 0;
    scene.add( CenterOrb );



    // sound beacons (pyramids)

    for ( var i = 0; i < 1; i ++ ) {
        let pos = [
            {x: -600, z: -50}
        ]
        var mesh = new THREE.Mesh( geometry, material );
        mesh.position.x = pos[i].x;
        mesh.position.y = 30;
        mesh.position.z = pos[i].z;
        mesh.updateMatrix();
        mesh.matrixAutoUpdate = false;
        mesh.castShadow = true; //default is false
        mesh.receiveShadow = true;
        CenterOrb.add( mesh );

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

        time *= 0.00005;

        window.addEventListener('resize', onWindowResize, false)

        // CenterOrb.rotation.y = time;

        renderer.outputEncoding = THREE.sRGBEncoding;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 0.2;

        requestAnimationFrame(render);
        renderer.setPixelRatio( window.devicePixelRatio );
        controls.update();  

        renderer.render(scene, camera);

        
    }

    requestAnimationFrame(render);
    controls.update();
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