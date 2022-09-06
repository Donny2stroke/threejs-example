import * as THREE from 'three';
//modulo per muovere la camera
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
//modulo dat.gui per modifiche visuali
import * as dat from 'dat.gui';

//importa immagini nebula e stelle
import nebula from '../img/nebula.jpg';
import stars from '../img/stars.jpg';

//importatore modelli personalizzati
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';

//importare url modello 3d personalizzato
const monkeyUrl = new URL('../assets/monkey.glb', import.meta.url)


const renderer = new THREE.WebGLRenderer();
//attiviamo le ombre
renderer.shadowMap.enabled = true;
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xFFEA00)
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

//di default impostata alle coordinate 0 0 0 
const camera = new THREE.PerspectiveCamera(
    45, //campo visivo verticale
    window.innerWidth / window.innerHeight, //rapporto aspetto
    0.01, //limite vicino
    1000 //limite lontano
);
const orbit = new OrbitControls(camera, renderer.domElement);
//camera.position.x = 0;
//camera.position.y = 2;
//camera.position.z = 5;
camera.position.set(0, 15, 50)
orbit.update();

//axesHelper mostra le righe degli assi
//il 5 indica la lunghezza dell'asse 
const axesHelper = new THREE.AxesHelper(3);
scene.add(axesHelper);

//helper che mostra il piano
const gridHelper = new THREE.GridHelper(30); //parametri non obbligatori. primo grandezza, secondo grandezza quadrati
scene.add(gridHelper);

//creazione cubo
//1) creazione geometria
const boxGeometry = new THREE.BoxGeometry(3, 3, 3);
//2) creazione materiale
//const boxMaterial = new THREE.MeshBasicMaterial({color: 0x00FF00});
const boxMaterial = new THREE.MeshStandardMaterial({color: 0x00FF00});
//3) applicazione materiale alla geometria
const box = new THREE.Mesh(boxGeometry, boxMaterial);
scene.add(box)
box.position.set(0, 3, 0)
box.receiveShadow = true;
box.castShadow = true;

//creazione piano
const planeGeometry = new THREE.PlaneGeometry(30, 30); //30 larghezza e altezza
const planeMaterial = new THREE.MeshStandardMaterial({
    color: 0xFFFFFF,
    side: THREE.DoubleSide //per applicare il materiale anche sotto
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
scene.add(plane);
plane.rotation.x = -0.5 * Math.PI;
//abilita la ricezione di ombre sul piano
plane.receiveShadow = true;
console.log(plane);

//creazione sfera
//con il materiale standard e non basic bisogna aggiungere le fonti di luce
//il materiale basic non è influenzato dalle sorgenti di luce
const sphereGeometry = new THREE.SphereGeometry(4, 50, 50); //1)raggio della sfera 2-3) numero di poligoni (più poligoni più risulta tonda e non spezzettata)
const sphereMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x0000FF,
    wireframe: false //per vedere lo scheletro della forma va a true
});
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
scene.add(sphere);
sphere.position.set(-8, 8, 0)
//abilita l'invio di ombre da parte della sfera
sphere.castShadow = true;
sphere.receiveShadow = true;


//istanza dell'importatore di modelli
//undefined funzione per il caricamento
const assetLoader = new GLTFLoader();
assetLoader.load(monkeyUrl.href, function(gltf){
    const model = gltf.scene;
    scene.add(model);
    model.position.set(4, 1, 5);
    var newMaterial = new THREE.MeshStandardMaterial({color: 0xff0000});
    model.traverse((o) => {
    if (o.isMesh) o.material = newMaterial;
    });
}, undefined, function(error){
    console.error(error);
})



//luce ambientale
const ambientLight = new THREE.AmbientLight(0x333333);
scene.add(ambientLight);

//luce direzionale
/*const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 0.8);
scene.add(directionalLight);
directionalLight.position.set(-30, 50, 0)
//abilita l'invio di ombre da parte del faretto luminoso
directionalLight.castShadow = true;
directionalLight.shadow.camera.bottom = -12;
//helper per luce direzionale
const dLightHelper = new THREE.DirectionalLightHelper(directionalLight, 30);
scene.add(dLightHelper);
//helper per le ombre
const dLightShadowHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
scene.add(dLightShadowHelper);*/

//luce faretto
const spotLight = new THREE.SpotLight(0xFFFFFF);
scene.add(spotLight);
spotLight.position.set(-100, 100, 0);
spotLight.castShadow = true;
spotLight.angle = 0.2; //si diminuisce l'angolo per evitare che l'ombra esca pixelata
const sLightHelper = new THREE.SpotLightHelper(spotLight)
scene.add(sLightHelper);


//Aggiungere fog primo metodo
//scene.fog = new THREE.Fog(0x000000, 0, 300) //0 limite vicino - 200 limite lontano
//Aggiungere fog secondo metodo
scene.fog = new THREE.FogExp2(0x000000, 0.01) //0.01 densità che cresce o diminuisce in automatico con la distanza


//in three prima di usare una risorsa bisogna caricarla
//1 sfondo per tutto
const textureLoader = new THREE.TextureLoader();
//scene.background = textureLoader.load(stars);
//6 immagini, una per ogni faccia della scena (la scena in sostanza è un cubo)
const cubeTextureLoader = new THREE.CubeTextureLoader();
scene.background = cubeTextureLoader.load([
    nebula,
    nebula,
    stars,
    stars,
    stars,
    stars,
]);


/* //cubo con sfondo uguale sulle facce
//1) creazione geometria
const box2Geometry = new THREE.BoxGeometry(3, 3, 3);
//2) creazione materiale
//const boxMaterial = new THREE.MeshBasicMaterial({color: 0x00FF00});
const box2Material = new THREE.MeshBasicMaterial({
    //impostare l'immagine al box direttamente così oppure...
    //map: textureLoader.load(nebula)
});
//3) applicazione materiale alla geometria
const box2 = new THREE.Mesh(box2Geometry, box2Material);
scene.add(box2)
box2.position.set(0, 15, 10)
box2.receiveShadow = true;
box2.castShadow = true;
box2.material.map = textureLoader.load(nebula); */

//cubo con sfondo diverso sulle facce
//1) creazione geometria
const box2Geometry = new THREE.BoxGeometry(3, 3, 3);
//2) creazione materiale
//const boxMaterial = new THREE.MeshBasicMaterial({color: 0x00FF00});
const box2Material = [
    new THREE.MeshBasicMaterial({map: textureLoader.load(stars)}),
    new THREE.MeshBasicMaterial({map: textureLoader.load(stars)}),
    new THREE.MeshBasicMaterial({map: textureLoader.load(stars)}),
    new THREE.MeshBasicMaterial({map: textureLoader.load(stars)}),
    new THREE.MeshBasicMaterial({map: textureLoader.load(nebula)}),
    new THREE.MeshBasicMaterial({map: textureLoader.load(nebula)}),
]
//3) applicazione materiale alla geometria
const box2 = new THREE.Mesh(box2Geometry, box2Material);
scene.add(box2)
box2.position.set(0, 15, 10)
box2.receiveShadow = true;
box2.castShadow = true;
box2.material.map = textureLoader.load(nebula);



// interfaccia visuale modifiche
const gui = new dat.GUI();
const options = {
    sphereColor: '#0000ff',
    wireframe:false,
    speed: 0.01,
    angle: 0.08,
    penumbra: 0.1,
    intensity: 0.9
}
gui.addColor(options, 'sphereColor').onChange(function(e){
    sphere.material.color.set(e);
});
gui.add(options, 'wireframe').onChange(function(e){
    sphere.material.wireframe = e;
});
gui.add(options, 'speed', 0, 0.05) //0 rappresenta il valore minimo, 0.01 il valore massimo
gui.add(options, 'angle', 0, 0.1)
gui.add(options, 'penumbra', 0, 0.1)
gui.add(options, 'intensity', 0, 1)

//variabili per far rimbalzare la sfera
let step = 0;


 const sphereId = sphere.id;
 const boxId = box.id;

//rotazione box
function animate(time){
    box.rotation.x += 0.01;
    box.rotation.y += 0.01;

    step+= options.speed;
    sphere.position.y = 10 * Math.abs(Math.sin(step));

    spotLight.angle = options.angle;
    spotLight.penumbra = options.penumbra;
    spotLight.intensity = options.intensity;
    //dobbiamo aggiornare l'helper per vedere le modifiche
    sLightHelper.update()

   

    renderer.render(scene, camera);
}

//renderizza la scena una volta
//renderer.render(scene, camera);

//renderizza la scena in loop chiamando la funzione animate()
renderer.setAnimationLoop(animate);









//passaggio del mouse sugli elementi e normalizzazione coordinate
/* const mousePosition = new THREE.Vector2();
 window.addEventListener('mousemove', function(e){
    mousePosition.x = (e.clientX / this.window.innerWidth) * 2 - 1;
    mousePosition.y = (e.clientY / this.window.innerHeight) * 2 + 1;
 })
 const rayCaster = new THREE.Raycaster(); */


//NELLA FUNZIONE ANIMATE
/* rayCaster.setFromCamera(mousePosition, camera);
const intersects = rayCaster.intersectObjects(scene.children);
//console.log(intersects);

for(let i = 0; i < intersects.length; i++){
    //console.log(intersects[i].object.id)
    if(intersects[i].object.id === sphereId){ 
            console.log(intersects[i].object.material.color.getHexString());
            if(intersects[i].object.material.color.getHexString() != "ff0000"){
                console.log("Pippo");
                intersects[i].object.material.color.set(0xFF0000);
            }else{
                intersects[i].object.material.color.set(0xAA1234);
            }
    }
} */