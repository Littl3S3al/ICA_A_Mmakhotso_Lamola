import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r119/build/three.module.js';



                
// three.js functions
 export const secondary  = (asset ) => {

    var isUserInteracting = false,
    onPointerDownMouseX = 0, onPointerDownMouseY = 0,
    lon = 0, onPointerDownLon = 0,
    lat = 0, onPointerDownLat = 0,
    phi = 0, theta = 0;

    const canvas = document.querySelector('#d');

    // renderer
    const renderer = new THREE.WebGLRenderer({canvas, antialias: true});
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // camera
    const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1100  );
    camera.target = new THREE.Vector3( 0, 0, 0 );


    // scene
    const scene = new THREE.Scene();
    scene.background = asset;

    
    canvas.addEventListener( 'pointerdown', onPointerDown, false );

    document.addEventListener( 'wheel', onDocumentMouseWheel, false );

    //

    document.addEventListener( 'dragover', function ( event ) {

        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';

    }, false );

    document.addEventListener( 'dragenter', function () {

        document.body.style.opacity = 0.5;

    }, false );

    document.addEventListener( 'dragleave', function () {

        document.body.style.opacity = 1;

    }, false );

    document.addEventListener( 'drop', function ( event ) {

        event.preventDefault();

        var reader = new FileReader();
        reader.addEventListener( 'load', function ( event ) {

            material.map.image.src = event.target.result;
            material.map.needsUpdate = true;

        }, false );
        reader.readAsDataURL( event.dataTransfer.files[ 0 ] );

        document.body.style.opacity = 1;

    }, false );

    //

    window.addEventListener( 'resize', onWindowResize, false );

			

    function onWindowResize() {

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize( window.innerWidth, window.innerHeight );

    }

    function onPointerDown( event ) {

        if ( event.isPrimary === false ) return;

        isUserInteracting = true;

        onPointerDownMouseX = event.clientX;
        onPointerDownMouseY = event.clientY;

        onPointerDownLon = lon;
        onPointerDownLat = lat;

        document.addEventListener( 'pointermove', onPointerMove, false );
        document.addEventListener( 'pointerup', onPointerUp, false );

    }

    function onPointerMove( event ) {

        if ( event.isPrimary === false ) return;

        lon = ( onPointerDownMouseX - event.clientX ) * 0.1 + onPointerDownLon;
        lat = ( event.clientY - onPointerDownMouseY ) * 0.1 + onPointerDownLat;

    }

    function onPointerUp() {

        if ( event.isPrimary === false ) return;

        isUserInteracting = false;

        document.removeEventListener( 'pointermove', onPointerMove );
        document.removeEventListener( 'pointerup', onPointerUp );

    }

    function onDocumentMouseWheel( event ) {

        var fov = camera.fov + event.deltaY * 0.05;

        camera.fov = THREE.MathUtils.clamp( fov, 10, 75 );

        camera.updateProjectionMatrix();

    }

    renderer.render( scene, camera );


    let render = () => {

        lat = Math.max( - 85, Math.min( 85, lat ) );
        phi = THREE.MathUtils.degToRad( 90 - lat );
        theta = THREE.MathUtils.degToRad( lon );

        camera.target.x = 500 * Math.sin( phi ) * Math.cos( theta );
        camera.target.y = 500 * Math.cos( phi );
        camera.target.z = 500 * Math.sin( phi ) * Math.sin( theta );

        camera.lookAt( camera.target );

        /*
        // distortion
        camera.position.copy( camera.target ).negate();
        */

        renderer.render( scene, camera );
                
        renderer.setPixelRatio( window.devicePixelRatio );

        renderer.render(scene, camera);
        requestAnimationFrame(render);


        
    }

    requestAnimationFrame(render);

}
