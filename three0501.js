//
// 応用プログラミング 課題8 (three0601.js)
// $Id$
//
"use strict"; // 厳格モード

// ３Ｄページ作成関数の定義
function init() {
  // 制御変数の定義
  const controls = {
  };

  // シーン作成
  const scene = new THREE.Scene();

  // カメラの作成
  const camera = new THREE.PerspectiveCamera(
    60, window.innerWidth/window.innerHeight, 0.1, 1000);
  camera.position.set(50, 20, 33);
  camera.lookAt(new THREE.Vector3(0, 0.8, 0));

  // レンダラの設定
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x2040A0);
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
  const roadmap1 = roadmap.clone();
  roadmap1.position.set(-100,0,0);
  scene.add(roadmap1);
  const roadmap2 = roadmap.clone();
  roadmap2.position.set(0,0,-75);
  scene.add(roadmap2);
  const roadmap3 = roadmap.clone();
  roadmap3.position.set(-100,0,-75);
  scene.add(roadmap3);

  // 光源の設定
  { // ディレクショナルライト
    const light = new THREE.DirectionalLight();
    light.castShadow = true;
    light.position.set(100, 80, 10);
    light.shadow.camera.near = .1;
    light.shadow.camera.far = 300;
    light.shadow.camera.right = 100;
    light.shadow.camera.left = -100;
    light.shadow.camera.top = 100;
    light.shadow.camera.bottom = -100;
    light.shadow.mapSize.width = 1024;
    light.shadow.mapSize.height = 1024

    scene.add(light);
  }
  { //アンビエントライト
    const light = new THREE.AmbientLight(0x404050);
    scene.add(light);
  }

  // 座標軸の表示
  const axis = new THREE.AxesHelper(10);
  scene.add(axis);
  axis.visible = false;

  // GUIコントローラ
  const gui = new dat.GUI();

  // 3Dモデル(GLTF形式)の読み込み
  const SCALE = 0.01;
  const PREFIX = "SHTV_Prefab_Car_"
  const loader = new THREE.GLTFLoader();
  let cars = [];
  let carNames = [];
  let lastName = "";
  let nCars = 0;
  loader.load("glTF/scene.gltf", model => {
    model.scene.traverse( obj => {
      if (obj.isMesh) {
        obj.castShadow = true;
        obj.material.needsUpdate = true;
      }
    });
    model.scene.traverse( obj => {
      if (obj.name.indexOf(PREFIX) == 0) {
        console.log(obj);
        const name = obj.name.substring(PREFIX.length);
        carNames.push(name);
        obj.position.set(0, 0, 0);
        obj.scale.set(SCALE, SCALE, SCALE);
        obj.rotation.y = 0;
        obj.visible = true;
        cars[name]=obj;
        if (lastName == "")
          lastName = name;
      }
    });
    carNames.map( name => {
      scene.add(cars[name]);
    })
    controls["car"] = lastName;
    gui.add(controls, "car", carNames);
    controls["Add a car"] = (() => {
      const name = controls.car;
      const name2 = name + nCars;
      cars[name2] = cars[name].clone();
      cars[name2].visible = true;
      scene.add(cars[name2]);
      nCars++;
    });
    gui.add(controls, "Add a car");
    gui.close();
    gui.open();
    cars[lastName].visible= true;
    requestAnimationFrame(update);
  });

  // 自動操縦コースの設定
  let course;
  let courseObj;
  {
    const controlPoints = [
      [80, 0, 45],
      [80, 0, 60],
      [20, 0, 60],
      [20, 0, 25],
      [-20, 0, 25],
      [-20, 0, 60],
      [-80, 0, 60],
      [-80, 0, -15],
      [-20, 0, -15],
      [-20, 0, -55],
      [80, 0, -55],
      [80, 0, -35],
      [40, 0, -35],
      [40, 0, -15],
      [25, 0, -15],
      [25, 0, 20],
      [80, 0, 20]
    ]
    const p0 = new THREE.Vector3();
    const p1 = new THREE.Vector3();
    course = new THREE.CatmullRomCurve3(
      controlPoints.map((p, i) => {
        p0.set(...p);
        p1.set(...controlPoints[(i+1)%controlPoints.length])
        return [
          (new THREE.Vector3()).copy(p0),
          (new THREE.Vector3()).lerpVectors(p0, p1, 0.1),
          (new THREE.Vector3()).lerpVectors(p0, p1, 0.9),
        ];
      }).flat(), true
    );
    const points = course.getPoints(250);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({color: 0xff0000});
    courseObj = new THREE.Line(geometry, material);
    courseObj.visible = false;
    material.depthTest = false;
    courseObj.renderOder = 1;
    courseObj.position.set(-100/2, 0, -75/2);
    scene.add(courseObj);
  }

  // 描画更新関数の定義
  const carPosition = new THREE.Vector3();
  const carTarget = new THREE.Vector3();
  function update(time) {
    {
      time *= 0.001;
      const pathTime = time * .02;
      let i = 0;
      nCars = Object.keys(cars).length;
      for (let carName in cars) {
        course.getPointAt((pathTime + i/nCars) % 1, carPosition);
        carPosition.applyMatrix4(courseObj.matrixWorld);
        cars[carName].position.copy(carPosition);
        course.getPointAt((pathTime + i/nCars + 0.01) % 1, carTarget);
        carTarget.applyMatrix4(courseObj.matrixWorld);
        cars[carName].lookAt(carTarget);
        i += 1;
      }
    }
    cameraControls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(update);
  }
}

document.onload = init();
