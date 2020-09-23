import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r119/build/three.module.js';
import {OrbitControls} from 'https://threejsfundamentals.org/threejs/resources/threejs/r119/examples/jsm/controls/OrbitControls.js';
import { Sky } from 'https://threejsfundamentals.org/threejs/resources/threejs/r119/examples/jsm/objects/Sky.js';
import { GUI } from 'https://threejsfundamentals.org/threejs/resources/threejs/r119/examples/jsm/libs/dat.gui.module.js';


// variables for event listeners
const beginBtn = document.querySelector('#btn-begin');
const overlay = document.querySelector('#overlay');
const threeJsWindow = document.querySelector('#three-js-container');
const popupWindow = document.querySelector('.popup-window');
const closeBtn = document.querySelector('#btn-close');

// three.js functions
const main  = () => {
    const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({canvas});

    const camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.x = 1000000000000;
    camera.position.y = -10;
    camera.position.z = 0;

    const cameraPostions = [

    ];
    let trackStep = 0;
    const forwardBtn = document.querySelector('.btn-forward');
    const backwardBtn = document.querySelector('.btn-backwards');

    forwardBtn.addEventListener('click', () => {

    })

    backwardBtn.addEventListener('click', () => {


    })

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2( 0xF48FB1  , 0.001 );

    // sky
    const sky = new Sky();
    sky.scale.setScalar( 450000 );
    scene.add( sky );

    const sun = new THREE.Vector3();

    const theta = Math.PI * ( 0.47 - 0.5 );
    const phi = 2 * Math.PI * ( 0.3 - 0.5 );
    sun.x = Math.cos( phi );
    sun.y = Math.sin( phi ) * Math.sin( theta );
    sun.z = Math.sin( phi ) * Math.cos( theta );

    const uniforms = sky.material.uniforms;
    uniforms[ "turbidity" ].value = 15;
    uniforms[ "rayleigh" ].value = 3;
    uniforms[ "mieCoefficient" ].value = 0;
    uniforms[ "mieDirectionalG" ].value = 0.7;
    uniforms[ "sunPosition" ].value.copy( sun );

    renderer.render( scene, camera );


    {
        const color = 0xFFFFFF;
        const intensity = 1;
        const light = new THREE.DirectionalLight(color, intensity);
        light.position.set(-1, 2, 4);
        scene.add(light);
      }

      {
        const light = new THREE.AmbientLight(0xFFFFFF, 0.5);
        scene.add(light);
      }

    

    
    // orbit controls
    const controls = new OrbitControls( camera, canvas );
    // controls.addEventListener( 'change', render );
    controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 100;
    controls.maxDistance = 200;
    controls.maxPolarAngle = Math.PI / 0.1;

    

    // set up world
    const geometry = new THREE.CylinderBufferGeometry( 0, 10, 30, 4, 1 );
    const material = new THREE.MeshPhongMaterial( { color: 0xffffff, flatShading: true } );


    const CenterOrb = new THREE.Mesh (geometry, material)
    CenterOrb.position.x = -600;
    CenterOrb.position.y = 0;
    scene.add( CenterOrb );

    for ( var i = 0; i < 500; i ++ ) {

        var mesh = new THREE.Mesh( geometry, material );
        mesh.position.x = Math.random() * 1600 - 800;
        mesh.position.y = 30;
        mesh.position.z = Math.random() * 1600 - 800;
        mesh.updateMatrix();
        mesh.matrixAutoUpdate = false;
        CenterOrb.add( mesh );

    }
   


    const resizeRendererToDisplaySize = (renderer) => {
        const canvas = renderer.domElement;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const needResize = canvas.width !== width || canvas.height !== height;
        if (needResize) {
        renderer.setSize(width, height, false);
        }
        return needResize;
    }



    const render = (time) => {

        time *= 0.0001;

        if (resizeRendererToDisplaySize(renderer)) {
        const canvas = renderer.domElement;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
        }

        CenterOrb.rotation.y = time;

        renderer.outputEncoding = THREE.sRGBEncoding;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 0.2;

        requestAnimationFrame(render);
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