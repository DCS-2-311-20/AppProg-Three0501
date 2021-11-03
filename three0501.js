//
// 応用プログラミング 課題8 (three0601.js)
// $Id$
//
"use strict"; // 厳格モード

// ３Ｄページ作成関数の定義
function init() {
  // 制御変数の定義
  const controls = {
    fov: 60, // 視野角
    x: 7,
    y: 2,
    z: 6,
  };

  // シーン作成
  const scene = new THREE.Scene();

  // カメラの作成
  const camera = new THREE.PerspectiveCamera(
    controls.fov, window.innerWidth/window.innerHeight, 0.1, 1000);
  // カメラ設定関数
  function cameraUpdate() {
    camera.fov = controls.fov;
    camera.position.set(controls.x, controls.y, controls.z);
    camera.lookAt(new THREE.Vector3(0, 0.8, 0));
    camera.updateProjectionMatrix();
  }

  // レンダラの設定
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x204060);
  renderer.shadowMap.enabled = true;
  document.getElementById("WebGL-output")
    .appendChild(renderer.domElement);

  // 建物群の作成

  // 平面の作成
  /*
  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(100,100),
    new THREE.MeshLambertMaterial({color: 0x404040}));
    plane.rotation.x = -Math.PI/2;
    plane.receiveShadow = true;
    scene.add(plane);
  */

  // 光源の設定
  const light = new THREE.PointLight();
  light.castShadow = true;
  light.position.set(30, 50, 20);
  scene.add(light);

  const axis = new THREE.AxesHelper(10);
  scene.add(axis);

  // GUIコントローラ
  const gui = new dat.GUI();
  gui.add(controls, "fov", 10, 100)
  gui.add(controls, "x", -100, 100)
  gui.add(controls, "y", 0, 100)
  gui.add(controls, "z", -100, 100)

  // 3Dモデル(GLTF形式)の読み込み
  //cameraUpdate();
  //update();
  const SCALE = 0.01;
  const PREFIX = "SHTV_Prefab_Car_"
  const loader = new THREE.GLTFLoader();
  let cars = [];
  let carNames = [];
  loader.load("glTF/scene.gltf", model => {
    console.log(model);
    model.scene.traverse(obj => {
      if (obj.name.indexOf(PREFIX) == 0) {
        const name = obj.name.substring(PREFIX.length);
        carNames.push(name);
        obj.position.set(0, 0, 0);
        obj.scale.set(SCALE, SCALE, SCALE);
        obj.rotation.y = 0;
        console.log(obj.name);
        cars[name]=obj;
        //cars.push(obj);
      }
    });
    scene.add(cars[carNames[0]]);
    update();
  });


  // 自動操縦コースの設定

  // 描画更新関数の定義
  function update(time) {
    cameraUpdate();
    renderer.render(scene, camera);
    requestAnimationFrame(update);
  }
  // 描画
  //cameraUpdate();
  //requestAnimationFrame(update);
}

document.onload = init();
