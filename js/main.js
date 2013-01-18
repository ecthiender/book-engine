(function(BE) {
  var _this = BE;
  var t = THREE, p = Physijs;
  var ASPECT = window.innerWidth / window.innerHeight;
  var MOVESPEED = 3, ACTUAL_LOOK_SPEED = 1;

  this.books = {};

  _this.init = function() {
    $('#loading').html('');
    if(!Detector.webgl) {
       Detector.addGetWebGLMessage(document.body);
       console.log('Could not detect WebGL. Quitting!');
       return;
    }

    // configure Physijs
    Physijs.scripts.worker = 'js/lib/physijs_worker.js';
    Physijs.scripts.ammo = 'ammo.js';

    this.loadBooks();
  };

  _this.loadBooks = function() {
    $.getJSON('books/books.json', function(books) {
      _this.books = books;
      _this.setup(); // first you have to setup the scene
      //_this.testCubeAdd();
      _this.renderBooks(); // and then only you can render the books
    });
  };

  _this.testCubeAdd = function() {
    var box = new Physijs.BoxMesh(
      new THREE.CubeGeometry(5, 5, 5),
      new THREE.MeshBasicMaterial({ color: 0x888888 })
    );
    this.scene.add(box);
    this.phy_box = box;
    var mesh =  new t.Mesh(
      new t.CubeGeometry(5,5,5),
      new t.MeshBasicMaterial({color: 0x888888})
    );
    console.log(mesh);
    console.log('adding mesh');
    this.scene.add(mesh);
  };

  _this.renderBooks = function() {
    for(var i in this.books) {
      var dim = this.books[i].dimensions;
      var faces = this.books[i].faces;
      var pos = this.books[i].position;
      var rot = this.books[i].rotation;
      var maps = [
        new t.MeshBasicMaterial({map: t.ImageUtils.loadTexture(faces[0])}),
        new t.MeshBasicMaterial({map: t.ImageUtils.loadTexture(faces[1])}),
        new t.MeshBasicMaterial({color: '0xffffff'}),
        new t.MeshBasicMaterial({color: '0xffffff'}),
        new t.MeshBasicMaterial({map: t.ImageUtils.loadTexture(faces[2])}),
        new t.MeshBasicMaterial({color: '0xffffff'})
      ];
      var mesh = new t.Mesh(
          new t.CubeGeometry(dim[0], dim[1], dim[2]),
          new t.MeshFaceMaterial(maps)
      );
      //mesh.position.set(pos[0], pos[1], pos[2]);
      this.scene.add(mesh);
    }
  };

  _this.setup = function() {
    this.clock = new t.Clock();
    this.deltaX = 0;
    this.thetaD = 0;
    this.old_mouseX = 0;

    this.cam = new t.PerspectiveCamera(35, ASPECT, 1, 1000);

    //this.scene = new p.Scene;
    this.scene = new t.Scene();
    this.scene.add(this.cam);
    this.cam.position.set(7, 2, -1);

    this.controls = new t.FirstPersonControls(this.cam);
    this.controls.movementSpeed = MOVESPEED;

    this.renderer = new t.WebGLRenderer({antialias: true});
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    document.body.appendChild(this.renderer.domElement);

    /* necessary event listeners */
    function bind(scope, fn) {
      return function() {
        fn.apply(scope, arguments);
      }
    }

    this.renderer.domElement.addEventListener('mousemove', bind(this, this.onMouseMove), false);

    this.render();
  };

  _this.render = function() {
    _this.fixMouseMove();
    //_this.scene.simulate(); //simulate physics
    _this.renderer.render(_this.scene, _this.cam);
    _this.controls.update(_this.clock.getDelta());
    requestAnimationFrame(_this.render);
  };

  _this.onMouseMove = function(event) {
    _this.deltaX = event.clientX - _this.old_mouseX;
    _this.old_mouseX = event.clientX;
  };

  // stop spinning the mouse forever on mouse move
  _this.fixMouseMove = function() {
    _this.thetaD -= _this.deltaX * ACTUAL_LOOK_SPEED;
    var theta = _this.thetaD * Math.PI / 180;
    var lookpoint = new t.Vector3(0, 0, 0);
    lookpoint.set(Math.sin(theta), 0, Math.cos(theta));
    //lookpoint.addSelf(_this.cam.position);
    lookpoint.add(_this.cam.position); //https://github.com/mrdoob/three.js/wiki/Migration :r54->r55
    _this.cam.lookAt(lookpoint);
    _this.deltaX = 0;
  };

})(BE);
