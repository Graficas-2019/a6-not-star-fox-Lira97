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
var crashBuilding= 0;
var floor;

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
var minDragonY = -2;
var MAXRobots = 4;
var objLoader = null
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

var particleGeometry;
var particleCount=20;
var explosionPower =1.06;

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
            tree.bbox = new THREE.Box3()
            tree.bbox.setFromObject(tree)
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
function loadEnemy()
{
    if(!objLoader)
        objLoader = new THREE.OBJLoader();
    
    objLoader.load('models/rock/rock1.obj',

        function(object)
        {
            var texture = new THREE.TextureLoader().load('models/rock/lunarrock_s.png');
            // var normalMap = new THREE.TextureLoader().load('models/rock/lunarrock_s.png');

            object.traverse( function ( child ) 
            {
                if ( child instanceof THREE.Mesh ) 
                {
                    child.castShadow = true;
                    child.receiveShadow = true;
                    child.material.map = texture;
                    // child.material.normalMap = normalMap;
                }
            } );
          

            enemy = object;
            // enemy.scale.set(.007,.007,.007);
            enemy.position.set(positionsX)
            enemy.rotation.set(Math.PI,0,0)
            enemy.bbox = new THREE.Box3()
            enemy.bbox.setFromObject(enemy)
            group.add(object);
            // enemies.push(enemy);
            
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
                    
            spaceship = object;
            spaceship.position.z = 80;
            spaceship.position.y = 2;
            spaceship.position.x = 0;
            spaceship.scale.set(.50,.50,.50);
            spaceship.rotation.set(Math.PI/19,Math.PI,0);
            group.add(object);
            spaceship.bbox = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());

        },
        function ( xhr ) {

            console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
            
    
        },
        // called when loading has errors
        function ( error ) {
    
            console.log( 'An error happened' );
    
        });
}

function bullet(initialPos)
{
    var geometry = new THREE.CylinderGeometry( .3, .3, 2, 32 );
    var material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
    var shot = new THREE.Mesh( geometry, material );

    shot.rotation.set(Math.PI,0,0)
    shot.position.copy(initialPos)
    shot.bbox = new THREE.Box3()
    shot.bbox.setFromObject(shot)
    return shot  
}
function cloneTree (i)
{
    var newDancer = tree.clone();
    newDancer.bbox = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
    newDancer.position.set(Math.random() * (max - min) + min,Math.random() * (maxDragonY - minDragonY) + minDragonY, -110);
    dancers.push(newDancer);
    scene.add(newDancer);
}
function cloneEnemies (i)
{
    var newEnemie = enemy.clone();
    newEnemie.bbox = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
    newEnemie.position.set(Math.random() * (max - min) + min,Math.random() * (maxDragonY - minDragonY) + minDragonY, -100);
    enemies.push(newEnemie);
    scene.add(newEnemie);
}


function animate() {
    spaceship.bbox.setFromObject(spaceship)

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

    if (dancers.length > 0) 
    {
        for(dancer_i of dancers)
        {
            console.log(dancer_i.position.x)
                dancer_i.bbox.setFromObject(dancer_i)
                if(spaceship.bbox.intersectsBox(dancer_i.bbox))
                {
                    crashBuilding += 1
                    if (crashBuilding >= 8)
                    {
                        crashBuilding = 0
                        document.getElementById("health").value -= 30;
                    }

                }

                dancer_i.position.z += 1.2 ;
                dancer_i.position.y = -4 ;   

        } 
            if(dancer_i.position.z >= camera.position.z-5)
            {  
                    dancer_i.position.set(Math.random() * (max - min) + min,Math.random() * (maxDragonY - minDragonY) + minDragonY, -105);
                
            }
    
    
    }

    if ( enemies.length > 0) 
    {
        for(enemies_i of enemies)
        {
                for(shot_i of shots)
                {
                    shot_i.bbox.setFromObject(shot_i)
                    enemies_i.bbox.setFromObject(enemies_i)
                    if(shot_i.bbox.intersectsBox(enemies_i.bbox))
                    {
                        explode(enemies_i.position.x,enemies_i.position.y,enemies_i.position.z);
                        scene.remove(shot_i)
                        score ++;
                        document.getElementById("score").innerHTML = "score: " +score;
                        enemies_i.position.set(Math.random() * (max - min) + min,Math.random() * (maxDragonY - minDragonY) + minDragonY, -100);
                        shots.splice(i, 1)
 
                    }
                }

                enemies_i.position.z += .7 ;
            
            if(enemies_i.position.z >= camera.position.z-5)
            {  
                    enemies_i.position.set(Math.random() * (max - min) + min,Math.random() * (maxDragonY - minDragonY) + minDragonY, -100);
                
            }
        }
    
    }
    doExplosionLogic();

    if(finish>1000||document.getElementById("health").value == 0)
    {
        gameStarted = now;
        gameMinutes+=1;
        document.getElementById("time").innerHTML = 60-gameMinutes+ " s";
        if(gameMinutes==60)
        {
            document.getElementById("startButton").style.display="block";
            document.getElementById("startButton").disabled = false;
            document.getElementById("health").value = 100
            game=false;
            for(dancer_i of dancers)
            {
                scene.remove(dancer_i); 
                
            }
            dancers.splice(1, dancers.length)

            for(enemies_i of enemies)
            {
                scene.remove(enemies); 
                
            }
            enemies.splice(0, enemies.length)

            for(shots_i of shots)
            {
                scene.remove(shots_i); 
                
            }
            shots.splice(1, shots.length)

            spaceship.position.z = 80;
            spaceship.position.y = 2;
            spaceship.position.x = 0;
            counter = 0;
            
        }
    }
    for(var i=0; i<shots.length; i++) {
        
        if(shots[i].position.z == -160) 
        {
            scene.remove(shots[i])
            shots.splice(i, 1)
        }
        else
        {
            shots[i].rotation.set(Math.PI/2,0,0)
            shots[i].position.z -= 3
        }
      }
}
function run() 
{
    requestAnimationFrame(function() { run(); });
    renderer.render( scene, camera );
        if(game)
        {
            animate();
            KF.update();
            animator.start();

        }

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
    renderer.shadowMap.enabled = true;
    // // Options are THREE.BasicShadowMap, THREE.PCFShadowMap, PCFSoftShadowMap
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Create a new Three.js scene
    scene = new THREE.Scene();

    // Add  a camera so we can view the scene
    camera = new THREE.PerspectiveCamera( 45, canvas.width / canvas.height, 1, 4000 );

    camera.position.set(0, 9, 117.9);

    camera.rotation.set(-Math.PI/18,0,0);
    scene.add(camera);
    //orbitControls = new THREE.OrbitControls(camera, renderer.domElement);

    // Create a group to hold all the objects
    root = new THREE.Object3D;

    spotLight = new THREE.SpotLight (0xffffff);
    spotLight.position.set(-20, 100, 0);
    spotLight.target.position.set(-2, 0, -2);
    root.add(spotLight);

    spotLight.castShadow = true;

    spotLight.shadow.camera.near = 1;
    spotLight.shadow.camera.far = 200;
    spotLight.shadow.camera.fov = 45;
    
    spotLight.shadow.mapSize.width = SHADOW_MAP_WIDTH;
    spotLight.shadow.mapSize.height = SHADOW_MAP_HEIGHT;

    ambientLight = new THREE.AmbientLight ( 0x888888 );
    root.add(ambientLight);

    loadObj();
    loadEnemy();
    loadTree();
    addExplosion();

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
	var loader = new THREE.TextureLoader();
	var materialArray = [];
	for (var i = 0; i < 6; i++)
		materialArray.push( new THREE.MeshBasicMaterial({
			map: loader.load( imagePrefix + directions[i] + imageSuffix ),
			side: THREE.BackSide
		}));
    var skyBox = new THREE.Mesh( skyGeometry, materialArray );
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
function handleKeyDown(keyEvent){
    if ( keyEvent.keyCode === 37) {
        if(spaceship.position.x > -22)
        spaceship.position.x -= 1.5

    } else if ( keyEvent.keyCode === 39) {
        if(spaceship.position.x < 22)
        spaceship.position.x += 1.5

	}else if ( keyEvent.keyCode === 38){
        if(spaceship.position.y <= 11)
        spaceship.position.y += 0.5
    }
    else if ( keyEvent.keyCode === 40){
        if(spaceship.position.y > -4)
        spaceship.position.y -= 0.5
    }
    else if(keyEvent.keyCode == 32)
    {
    var shipPosition = spaceship.position.clone()
    var shot = bullet(shipPosition)
    shots.push(shot)
    scene.add(shot)
    }
	
}
function doExplosionLogic()
{
	if(!particles.visible)return;
	for (var i = 0; i < particleCount; i ++ ) {
		particleGeometry.vertices[i].multiplyScalar(explosionPower);
	}
	if(explosionPower>1.005){
		explosionPower-=0.001;
	}else{
		particles.visible=false;
	}
	particleGeometry.verticesNeedUpdate = true;
}
function explode(x,y,z)
{
	particles.position.y=y;
	particles.position.z=z;
	particles.position.x=x;
	for (var i = 0; i < particleCount; i ++ ) {
		var vertex = new THREE.Vector3();
		vertex.x = -0.2+Math.random() * 0.4;
		vertex.y = -0.2+Math.random() * 0.4 ;
		vertex.z = -0.2+Math.random() * 0.4;
		particleGeometry.vertices[i]=vertex;
	}
	explosionPower=1.07;
	particles.visible=true;
}
function addExplosion(){
	particleGeometry = new THREE.Geometry();
	for (var i = 0; i < particleCount; i ++ ) {
		var vertex = new THREE.Vector3();
		particleGeometry.vertices.push( vertex );
	}
	var pMaterial = new THREE.PointsMaterial({
	  color: 0xC7C2BA,
	  size: .5
	});
	particles = new THREE.Points( particleGeometry, pMaterial );
	scene.add( particles );
	particles.visible=false;
}