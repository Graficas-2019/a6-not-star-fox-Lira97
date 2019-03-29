var renderer = null, 
scene = null,raycaster , 
camera = null,
root = null,
robot_idle = null,
robot_attack = null,
flamingo = null,
dancer = null,
stork = null,
group = null,groupTree=null,
orbitControls = null;
var game = false;
var floor;
var sphericalHelper;
var worldRadius=26;
var mouse = new THREE.Vector2(), INTERSECTED, CLICKED;
var counter = 0;
var actualTime = 0;
var highScore = 0;
var animator = null,
duration1 = 1, 
loopAnimation = false;
var robot_mixer = {};
var deadAnimator;
var morphs = [];
var dancers = [];
var robot_mixers = [];
var animationsFromFBX = [];
var score = 0;
var duration = 20000; // ms
var currentTime = Date.now();
var max = 22;
var min = -22;
var maxDragonY = 8;
var minDragonY = -4;
var MAXRobots = 15;
var objLoader = null
var backgroundScene = new THREE.Scene();
var backgroundCamera = new THREE.Camera();
var positionsX;
var animation = "idle";
var shots= [];
var enemies= [];
var crateAnimator = null,
waveAnimator = null,
lightAnimator = null,
waterAnimator = null,
animateCrate = true,
animateWaves = true,
animateLight = true,
animateWater = true,
loopAnimation = false;


function playAnimations()
{
    animator.start();
}

function startGame()
{

    if(highScore<score)
    {
         highScore = score;
    }
        
    document.getElementById("highScore").innerHTML = "best score: " +highScore;
    gameMinutes = 0
    gameStarted = Date.now();
    actualTime = Date.now();
    actualTime2 = Date.now();
    score = 0;
    names = 0;
    robotsSpawned = 0;
    document.getElementById("time").innerHTML = 60+" s";
    document.getElementById("score").innerHTML = "score: " +score;
    document.getElementById("startButton").style.display="none";
    document.getElementById("startButton").disabled = true;
    

    game = true;
    
}
function changeAnimation(animation_text)
{
    animation = animation_text;

    if(animation =="dead")
    {
        createDeadAnimation();
    }
    else
    {
        robot_idle.rotation.x = 0;
    }
}

function createDeadAnimation()
{

}

function loadTree()
{
    if(!objLoader)
        objLoader = new THREE.OBJLoader();
    objLoader.load('models/Building/Building.obj',

        function(object)
        {
            var normalMap = new THREE.TextureLoader().load('models/Building/ResidentialBump.jpg');
            var texture = new THREE.TextureLoader().load('models/Building/ResidentialDiffuse.jpg');

            object.traverse( function ( child ) 
            {
                if ( child instanceof THREE.Mesh ) 
                {
                    child.castShadow = true;
                    child.receiveShadow = true;
                    child.material.map = texture;
                    child.material.normalMap = normalMap;
                }
            } );                
            tree = object;
            tree.scale.set(.0050,.0050,.0050);
            tree.position.set(positionsX)
            group.add(object);
            dancers.push(tree);
            scene.add( tree );
        },

        function ( xhr ) {

            console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
    
        },
        // called when loading has errors
        function ( error ) {
    
            console.log( 'An error happened' );
    
        });

     
}
function loadEnemy()
{
    if(!objLoader)
        objLoader = new THREE.OBJLoader();
    
    objLoader.load('models/Dragon/Dragon.obj',

        function(object)
        {
            var texture = new THREE.TextureLoader().load('models/Dragon/Texture2.png');
            var normalMap = new THREE.TextureLoader().load('models/Dragon/Texture.png');

            object.traverse( function ( child ) 
            {
                if ( child instanceof THREE.Mesh ) 
                {
                    child.castShadow = true;
                    child.receiveShadow = true;
                    child.material.map = texture;
                    child.material.normalMap = normalMap;
                }
            } );
            enemy = object;
            enemy.scale.set(.07,.07,.07);
            enemy.position.set(positionsX)
            enemy.bbox = new THREE.Box3()
            group.add(object);
            enemies.push(enemy);
            scene.add( enemy );
        },
        function ( xhr ) {

            console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
    
        },
        // called when loading has errors
        function ( error ) {
    
            console.log( 'An error happened' );
    
        });
}

function loadObj()
{
    if(!objLoader)
        objLoader = new THREE.OBJLoader();
    
    objLoader.load('models/spaceship/spaceship.obj',

        function(object)
        {
            var normalMap = new THREE.TextureLoader().load('models/spaceship/mat.png');
            var texture = new THREE.TextureLoader().load('models/spaceship/int.png');

            object.traverse( function ( child ) 
            {
                if ( child instanceof THREE.Mesh ) 
                {
                    child.castShadow = true;
                    child.receiveShadow = true;
                    child.material.map = texture;
                    child.material.normalMap = normalMap;
                }
            } );
                    
            gun = object;
            gun.position.z = 80;
            gun.position.y = 2;
            gun.position.x = 0;
            gun.scale.set(.50,.50,.50);
            gun.rotation.set(Math.PI/19,Math.PI,0);
            group.add(object);
        },
        function ( xhr ) {

            console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
    
        },
        // called when loading has errors
        function ( error ) {
    
            console.log( 'An error happened' );
    
        });
}

function cloneTree (i)
{
    var newDancer = tree.clone();
    newDancer.position.set(Math.random() * (max - min) + min, -90, -100);
    newDancer.name = i;
    newDancer.living = 1;
    newDancer.dead = 0;
    dancers.push(newDancer);
    scene.add(newDancer);
}
function bullet(initialPos)
{
    var shotMtl = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        transparent: true,
      })
      var shot = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 16),shotMtl)
        shot.position.copy(initialPos)
        shot.bbox = new THREE.Box3()
        return shot  
}

function cloneEnemies (i)
{
    var newEnemie = enemy.clone();
    newEnemie.position.set(Math.random() * (max - min) + min,Math.random() * (maxDragonY - minDragonY) + minDragonY, -100);
    newEnemie.name = i;
    newEnemie.living = 1;
    newEnemie.dead = 0;
    enemies.push(newEnemie);
    scene.add(newEnemie);
}

function animate() {

    var now = Date.now();
    var deltat = now - currentTime;
    var finish = now - gameStarted;
    currentTime = now;
   
    var seconds = (now - actualTime)/1000


    if (seconds >= 1.5 )
    {
        if ( counter < MAXRobots) 
        {
                counter += 1;
                cloneTree(counter);
                cloneEnemies(counter);
                actualTime = now; 
                    }
    }

    if ( dancers.length > 0) 
    {
        for(dancer_i of dancers)
        {
            if(dancer_i.living==1)
            {
                // dancer_i.lookAt(camera.position);
                // dancer_i.translateZ(1.2);
                dancer_i.position.z += 1.2 ;
                dancer_i.position.y = -4 ;   
                // dancer_i.mixer.update( ( deltat ) * 0.001 );        

            } 
            else if (dancer_i.living==0) 
            {
                var seconds2 = (now - dancer_i.dead)/1000
                if (seconds2 >= 1 )
                {
                    score ++;
                    document.getElementById("score").innerHTML = "score: " +score;
                    dancer_i.position.set(Math.random() * (max - min) + min, -4, -100);
                    dancer_i.rotation.set(0,0,0);  
                    // dancer_i.mixer.update( ( deltat ) * 0.001 ); 
                    dancer_i.living=1; 
                }
                
            }
            if(dancer_i.position.z >= camera.position.z-5)
            {  
                    score --;
                    dancer_i.position.set(Math.random() * 100 - 10, -4, -100); 
                    // dancer_i.mixer.update( ( deltat ) * 0.001 ); 
                    document.getElementById("score").innerHTML = "score: " +score;
                
            }
        }
    
    }

    if ( enemies.length > 0) 
    {
        for(enemies_i of enemies)
        {
            if(enemies_i.living==1)
            {
                // enemies_i.lookAt(camera.position);
                // enemies_i.translateOnAxis (gun.position,.0096)
                // enemies_i.translateZ(.6);
                enemies_i.position.z += .7 ;
                // enemies_i.position.y = 7;   
                // dancer_i.mixer.update( ( deltat ) * 0.001 );        

            } 
            else if (enemies_i.living==0) 
            {
                var seconds2 = (now - enemies_i.dead)/1000
                if (seconds2 >= 1 )
                {
                    score ++;
                    document.getElementById("score").innerHTML = "score: " +score;
                    enemies_i.position.set(Math.random() * (max - min) + min, Math.random() * (maxDragonY - minDragonY) + minDragonY, -100);
                    enemies_i.rotation.set(0,0,0);  
                    // dancer_i.mixer.update( ( deltat ) * 0.001 ); 
                    enemies_i.living=1; 
                }
                
            }
            if(enemies_i.position.z >= camera.position.z-5)
            {  
                    score --;
                    enemies_i.position.set(Math.random() * 100 - 10,  Math.random() * (maxDragonY - minDragonY) + minDragonY, -100); 
                    // dancer_i.mixer.update( ( deltat ) * 0.001 ); 
                    document.getElementById("score").innerHTML = "score: " +score;
                
            }
        }
    
    }
    if(finish>1000)
    {
        gameStarted = now;
        gameMinutes+=1;
        document.getElementById("time").innerHTML = 60-gameMinutes+ " s";
        if(gameMinutes==60)
        {
            document.getElementById("startButton").style.display="block";
            document.getElementById("startButton").disabled = false;
            game=false;
            for(dancer_i of dancers)
            {
                scene.remove(dancer_i); 
                
            }
            dancers.splice(1, dancers.length-1)
            counter = 0;
            
        }
    }
    
    for(var i=0; i<shots.length; i++) {
        
        if(shots[i].position.z == -160) {
          shots.splice(i, 1)
          scene.remove(shots[i])
        }
        else
        {
            shots[i].position.z -= 10
        }
      }
    
    // if(animation =="dead")
    // {
    //     KF.update();
    // }
}
function run() 
{
    requestAnimationFrame(function() { run(); });
    renderer.clear();
    renderer.render( backgroundScene, backgroundCamera );
    renderer.render( scene, camera );
        if(game)
        {
            animate();
            KF.update();
            animator.start();

        }
        //  orbitControls.update();

}

var directionalLight = null;
var spotLight = null;
var ambientLight = null;
var mapUrl = "images/grass.png";

var SHADOW_MAP_WIDTH = 2048, SHADOW_MAP_HEIGHT = 2048;

function createScene(canvas) {
    
    // Create the Three.js renderer and attach it to our canvas
    renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } );

    // Set the viewport size
    renderer.setSize(window.innerWidth, window.innerHeight);

    // // Turn on shadows
    // renderer.shadowMap.enabled = true;
    // // Options are THREE.BasicShadowMap, THREE.PCFShadowMap, PCFSoftShadowMap
    // renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Create a new Three.js scene
    scene = new THREE.Scene();

    // Add  a camera so we can view the scene
    camera = new THREE.PerspectiveCamera( 45, canvas.width / canvas.height, 1, 4000 );
    // camera.position.set(0, 150, 180);

    // camera.position.set(0, 3.4, 110.8);

    camera.position.set(0, 3.4, 117.9);

    camera.rotation.set(0,0,0);
    scene.add(camera);
    //  orbitControls = new THREE.OrbitControls(camera, renderer.domElement);
    var texture = THREE.ImageUtils.loadTexture( 'images/back.jpg' );
    var backgroundMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2, 0),
    new THREE.MeshBasicMaterial({
                 map: texture
             }));

    backgroundMesh .material.depthTest = false;
    backgroundMesh .material.depthWrite = false;

    //      // Create your background scene
    backgroundScene .add(backgroundCamera );
    backgroundScene .add(backgroundMesh );
        
    // Create a group to hold all the objects
    root = new THREE.Object3D;
    
    directionalLight = new THREE.DirectionalLight( 0xffffff, 1);

    // Create and add all the lights
    directionalLight.position.set(0, 1, 2);
    root.add(directionalLight);

    ambientLight = new THREE.AmbientLight ( 0x888888 );
    root.add(ambientLight);
    
    loadObj();
    loadEnemy();
    loadTree()
    // Create a group to hold the objects
    group = new THREE.Object3D;
    root.add(group);

    groupTree = new THREE.Object3D;
    root.add(groupTree);
    sphericalHelper = new THREE.Spherical();


    // Create a texture map
    var map = new THREE.TextureLoader().load(mapUrl);
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.repeat.set(4, 4);

    var color = 0xffffff;

    // // Put in a ground plane to show off the lighting
    geometry = new THREE.PlaneGeometry(200, 200, 50, 50);
    floor = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({color:color, map:map, side:THREE.DoubleSide}));
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -4.02;
    
    // // Add the mesh to our group
    group.add( floor );
 
    floor.castShadow = false;
    floor.receiveShadow = true;
    // Now add the group to our scene
    scene.add( root );

    // axes
	
	var imagePrefix = "images/back-";
	var directions  = ["xpos", "xneg", "ypos", "yneg", "zpos", "zneg"];
	var imageSuffix = ".png";
	var skyGeometry = new THREE.CubeGeometry( 230, 100, 200 );	
	
	var materialArray = [];
	for (var i = 0; i < 6; i++)
		materialArray.push( new THREE.MeshBasicMaterial({
			map: THREE.ImageUtils.loadTexture( imagePrefix + directions[i] + imageSuffix ),
			side: THREE.BackSide
		}));
	var skyMaterial = new THREE.MeshFaceMaterial( materialArray );
    var skyBox = new THREE.Mesh( skyGeometry, skyMaterial );
    skyBox.position.set(0,20,0)
	scene.add( skyBox );
	
        
    // document.addEventListener( 'mousemove', onDocumentMouseMove );
    document.onkeydown = handleKeyDown;
    window.addEventListener( 'resize', onWindowResize);
    // initAnimations();
}
function onWindowResize() 
{
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}
// function onDocumentMouseDown(event)
// {
//     event.preventDefault();

//     mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
//     mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

//     raycaster.setFromCamera( mouse, camera );

//     var intersects = raycaster.intersectObjects( dancers, true );

//     if ( intersects.length > 0 ) 
//     {
//         CLICKED = intersects[ 0 ].object;
//         if(!animator.running)
//         {
//             for(var i = 0; i<= animator.interps.length -1; i++)
//             {
//                 animator.interps[i].target = dancers[CLICKED.parent.name].rotation;
//                 dancers[CLICKED.parent.name].living = 0;
//                 dancers[CLICKED.parent.name].dead = Date.now();
            
//             }
            
//             playAnimations();
//         }
//     } 
//     else 
//     {
//         if ( CLICKED ) 
//             CLICKED.material.emissive.setHex( CLICKED.currentHex );

//         CLICKED = null;
//     }
// }
function playAnimations()
{    
  
    animator = new KF.KeyFrameAnimator;
    animator.init({ 
            interps:
                [
                    { 
                        keys:[0, 1], 
                        values:[
                                { x : 0, y : 0 },
                                { x : 0, y : 1 },
                                ],
                        target:floor.material.map.offset
                    },
                ],
            loop: loopAnimation,
            duration1:duration,
        });
            
}
// function initAnimations() 
// {
//     animator = new KF.KeyFrameAnimator;
//     animator.init({ 
//         interps:
//             [
//                 { 
//                     keys:[0, .30, .60, 1], 
//                     values:[
//                             { x: 0, y : 0, z : 0 },
//                             { x:-Math.PI/6, y : Math.PI/7, z : 0 },
//                             { x:-Math.PI/6 * 2, y : Math.PI/7 *2, z : 0},
//                             { x:-Math.PI/6 * 3, y : Math.PI/7 *3, z : 0 },
//                             ],
//                 },
//             ],
//         loop: loopAnimation,
//         duration1:duration,
//     });    

// }

function handleKeyDown(keyEvent){
    if ( keyEvent.keyCode === 37) {
        if(gun.position.x > -22)
        gun.position.x -= 1.5

    } else if ( keyEvent.keyCode === 39) {
        if(gun.position.x < 22)
        gun.position.x += 1.5

	}else if ( keyEvent.keyCode === 38){
        if(gun.position.y <= 11)
        gun.position.y += 0.5
    }
    else if ( keyEvent.keyCode === 40){
        if(gun.position.y > -4)
        gun.position.y -= 0.5
    }
    else if(keyEvent.keyCode == 32)
    {
    var shipPosition = gun.position.clone()
    // shipPosition.sub(new THREE.Vector3(0, 25, 100))
    var shot = bullet(shipPosition)
    shots.push(shot)
    scene.add(shot)
    console.log(shots)
    }
	
}