//
// 応用プログラミング 課題8 (three0601.js)
// $Id$
//
"use strict"; // 厳格モード

// ３Ｄページ作成関数の定義
function init() {
  // 制御変数の定義
  const controls = {};

  // シーン作成
  const scene = new THREE.Scene();

  // カメラの作成
  const camera = new THREE.PerspectiveCamera(
    60, window.innerWidth/window.innerHeight, 0.1, 1000);
  camera.position.set(7, 2, 6);
  camera.lookAt(new THREE.Vector3(0, 0.8, 0));

  // レンダラの設定
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x204060);
  renderer.shadowMap.enabled = true;
  document.getElementById("WebGL-output")
    .appendChild(renderer.domElement);

  // カメラの制御を入れる
  const cameraControls = new THREE.TrackballControls(camera,
     document.getElementById("WebGL-output"));

  // 平面の作成
  const textureLoader = new THREE.TextureLoader();
  const texture = textureLoader.load("png/roadmap.png");
  const roadmap = new THREE.Mesh(
    new THREE.PlaneGeometry(100,75),
    new THREE.MeshLambertMaterial({map: texture}));
    roadmap.rotation.x = -Math.PI/2;
    roadmap.receiveShadow = true;
    scene.add(roadmap);


  // 光源の設定
  const light = new THREE.PointLight();
  light.castShadow = true;
  light.position.set(3, 5, 2);
  scene.add(light);

  const alight = new THREE.AmbientLight();
  scene.add(alight);

  const axis = new THREE.AxesHelper(10);
  scene.add(axis);

  // GUIコントローラ
  const gui = new dat.GUI();

  // 3Dモデル(GLTF形式)の読み込み
  //cameraUpdate();
  //update();
  const SCALE = 0.01;
  const PREFIX = "SHTV_Prefab_Car_"
  const loader = new THREE.GLTFLoader();
  let cars = [];
  let carNames = [];
  let lastName = "";
  loader.load("glTF/scene.gltf", model => {
    console.log(model);
    model.scene.traverse( obj => {
      if (obj.name.indexOf(PREFIX) == 0) {
        const name = obj.name.substring(PREFIX.length);
        carNames.push(name);
        obj.position.set(0, 0, 0);
        obj.scale.set(SCALE, SCALE, SCALE);
        obj.rotation.y = 0;
        obj.visible = false;
        cars[name]=obj;
        if (lastName == "")
          lastName = name;
        //cars.push(obj);
      }
    });
    carNames.map( name => {
      scene.add(cars[name]);
    })
    controls["car"] = lastName;
    gui.add(controls, "car", carNames).onChange(name => {
      cars[lastName].visible = false;
      cars[name].visible = true;
      lastName=name;
    });
    gui.close();gui.open();
    cars[lastName].visible = true;
    console.log(carNames);
    update();
  });


  // 自動操縦コースの設定

  // 描画更新関数の定義
  function update(time) {
    //cameraUpdate();
    cameraControls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(update);
  }
  // 描画
  cameraUpdate();
  //requestAnimationFrame(update);
}

document.onload = init();
