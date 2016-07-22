/* jshint esnext: true */
/* jshint asi: true */
var renderer = new THREE.WebGLRenderer({antialias: true})
var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 3000)
var scene = new THREE.Scene()

var SCALE_X = 8, SCALE_Y = 10, SCALE_Z = 8
var OFF_X = 0, OFF_Y = 300, OFF_Z = 1500

var HEAD = 1
var LEFT_HAND = 2
var RIGHT_HAND = 3

function deg2rad(angle) {
  return (angle / 180.0) * Math.PI
}

renderer.setPixelRatio(window.devicePixelRatio)
renderer.setSize(window.innerWidth, window.innerHeight)

camera.position.set(0, 0, 500)
var socket = new WebSocket(`ws://${window.location.hostname}:8080`)
socket.binaryType = 'arraybuffer'
socket.onmessage = function(evt) {
  var view = new DataView(evt.data)
  var type = view.getUint8(0)

  switch(type) {
    case HEAD:
      camera.position.set((view.getFloat32(1) - OFF_X) / SCALE_X, (view.getFloat32(5) - OFF_Y) / SCALE_Y, (view.getFloat32(9) - OFF_Z) / SCALE_Z)
    break
    case LEFT_HAND:
      left.position.set((view.getFloat32(1) - OFF_X) / SCALE_X, (view.getFloat32(5) - OFF_Y) / SCALE_Y, (view.getFloat32(9) - OFF_Z) / SCALE_Z)
    break
    case RIGHT_HAND:
      right.position.set((view.getFloat32(1) - OFF_X) / SCALE_X, (view.getFloat32(5) - OFF_Y) / SCALE_Y, (view.getFloat32(9) - OFF_Z) / SCALE_Z)
    break
  }
}
/*
var head = new THREE.Mesh(
  new THREE.BoxGeometry(100, 100, 100),
  new THREE.MeshBasicMaterial({wireframe: true})
);
*/
var left = new THREE.Mesh(
  new THREE.SphereGeometry(10, 32, 32),
  new THREE.MeshBasicMaterial({color: 0xff0000, wireframe: true})
)
var right = new THREE.Mesh(
  new THREE.SphereGeometry(10, 32, 32),
  new THREE.MeshBasicMaterial({color: 0x00ff00, wireframe: true})
)

scene.add(left)
scene.add(right)

var sky = new THREE.Mesh(
  new THREE.SphereGeometry(2000, 24, 24),
  new THREE.MeshBasicMaterial({
    map: new THREE.TextureLoader().load('skybox.jpg'),
    side: THREE.BackSide
  })
)

scene.add(sky)

var floorTex = new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load("floor.jpg", null, function() {
  floorTex.map.wrapS = floorTex.map.wrapT = THREE.RepeatWrapping
  floorTex.map.repeat.set(50, 50)
  floorTex.map.needsUpdate = true
  floorTex.needsUpdate = true
})})

var floor = new THREE.Mesh(
  new THREE.PlaneGeometry(4000, 4000),
  floorTex
);

scene.add(floor)
floor.rotation.x = -Math.PI/2;
floor.position.y = -50;

var mtlLoader = new THREE.MTLLoader()
mtlLoader.setPath('model/')
mtlLoader.load('model.mtl', function(materials) {
	materials.preload()
	var objLoader = new THREE.OBJLoader()
	objLoader.setMaterials(materials)
	objLoader.setPath('model/')
	objLoader.load('model.obj', function(object) {
    object.scale.set(100, 100, 100)
		object.position.set(10, -150, 850)
//		scene.add(object)
    console.log('LOADED')
    window.model = object
	})
})

var ambient = new THREE.AmbientLight( 0xffffff )
scene.add(ambient)

var controls = new THREE.VRControls(camera)
var effect = new THREE.VREffect(renderer)

effect.setSize(window.innerWidth, window.innerHeight)

window.addEventListener('resize', function() {
  effect.setSize(window.innerWidth, window.innerHeight)
})

function render() {
  effect.render(scene, camera)
  controls.update()
  requestAnimationFrame(render)

}

function start() {

  screen.lockOrientationUniversal = screen.lockOrientation || screen.mozLockOrientation || screen.msLockOrientation

  if (screen.lockOrientationUniversal) {
    screen.lockOrientationUniversal('landscape')
  } else if(screen.orientation && screen.orientation.lock) {
    screen.orientation.lock('landscape').then(function() {
    }, function() { console.log('no lock') })
  }

  document.body.appendChild(renderer.domElement)
  effect.requestPresent()
  render()
}

document.querySelector('button').addEventListener('click', start)
