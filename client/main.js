/* jshint esnext: true */
/* jshint asi: true */
var renderer = new THREE.WebGLRenderer({antialias: true})
var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000)
var scene = new THREE.Scene()

var SCALE_X = 10, SCALE_Y = 10, SCALE_Z = 10
var OFF_X = 0, OFF_Y = 300, OFF_Z = 1500

var HEAD = 1
var LEFT_HAND = 2
var RIGHT_HAND = 3

function deg2rad(angle) {
  return (angle / 180.0) * Math.PI
}

renderer.setPixelRatio(window.devicePixelRatio)
renderer.setSize(window.innerWidth, window.innerHeight)

document.body.appendChild(renderer.domElement)

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
/*
scene.add(left);
scene.add(right);
*/
var mtlLoader = new THREE.MTLLoader()
mtlLoader.setPath('model/')
mtlLoader.load('model.mtl', function(materials) {
	materials.preload()
	var objLoader = new THREE.OBJLoader()
	objLoader.setMaterials(materials)
	objLoader.setPath('model/')
	objLoader.load('model.obj', function(object) {
    object.scale.set(100, 100, 100)
		object.position.set(10, -100, 850)
		scene.add(object)
    console.log('LOADED')
    window.model = object
	})
})

var ambient = new THREE.AmbientLight( 0xffffff )
scene.add(ambient)

function render() {
  renderer.render(scene, camera)
  requestAnimationFrame(render)
}

render()

window.addEventListener("deviceorientation", function(evt) {
  var heading = evt.alpha,
        pitch   = evt.gamma

    // Correcting the sensors being "clever"
    if(Math.abs(evt.beta) > 45) {
      heading += 90
    } else {
      heading -= 90
    }

    if(pitch < 0) {
      pitch = -90 - pitch
    } else {
      pitch =  90 - pitch
    }

    if(heading < 0) heading = 360 + heading

    camera.rotation.set(0, deg2rad(heading), 0)
    evt.preventDefault()
});
