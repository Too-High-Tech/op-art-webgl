'use strict';

import Plane from './objects/Plane';
import Cube from './objects/Cube';
import THREE from 'three';
import Utils from './Utils';
import _ from 'underscore';
window.THREE = THREE;
import dat from 'dat-gui';
import CanvasManager from './canvas/CanvasManager';
let gui;
let start = Date.now();
let controls;


export default class Webgl {
  constructor(width, height) {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(50, width / height, 1, 1000);
    this.camera.position.z = 500;

    let canvas = document.querySelector("#webgl");
    this.renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha:true
    });
    this.renderer.setSize(width, height);
    this.renderer.setClearColor( 0xFFFFFF, 1 );

    controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);

    this.usePostprocessing = true;
    this.composer = new WAGNER.Composer(this.renderer);
    this.composer.setSize(width, height);
    this.initPostprocessing();

    this.mouse = {
      x: 0,
      y: 0
    }

    this.cube = new Cube();
    window.cube = this.cube;
    this.scene.add(this.cube);

    this.plane = new Plane();
    this.scene.add(this.plane);


    let canvasManager = new CanvasManager(500, 500);
    let texture = new THREE.Texture(canvasManager.canvas);

    gui = new dat.GUI();
    console.log(this.camera.position);
    gui.add(this.camera.position, 'x',  0,500 );
    gui.add(this.camera.position, 'y',0,500 );
    gui.add(this.camera.position, 'z',0,500 );


  }

  initPostprocessing() {
    if (!this.usePostprocessing) return;

    //  this.vignette2Pass = new WAGNER.Vignette2Pass(20,20);

  }

  resize(width, height) {
    this.composer.setSize(width, height);

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  };

  mousemove(x, y) {
    // console.log(x,y);
    this.mouse = {
      x: x - window.innerWidth / 2,
      y: y - window.innerHeight / 2
    }

  };

  render(data) {
    if (this.usePostprocessing) {
      this.composer.reset();
      this.composer.renderer.clear();
      this.composer.render(this.scene, this.camera);
      //  this.composer.pass(this.vignette2Pass);
      this.composer.toScreen();
    } else {
      this.renderer.autoClear = false;
      this.renderer.clear();
      this.renderer.render(this.scene, this.camera);
    }

    // this.camera.position.x += ( this.mouse.x - this.camera.position.x ) * 0.001;
    // this.camera.position.x = Utils.clamp(this.camera.position.x,-100,100);
    //
    // // console.log(this.camera.position.x);
    // this.camera.position.y += ( -( this.mouse.y - 200 ) - this.camera.position.y ) * .0005;

    this.camera.lookAt(this.scene.position);

    if(data.acuteAverage>0.4){
      this.cube.rotate(Math.floor(Math.random()*4))
    }
    this.plane.update(data.fregAverage,data.freq5);
    this.cube.update();
    controls.update();

  }
}
