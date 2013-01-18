(function(BE) {
  // vars for perspective view book
  // making them global for I dont know why
      var targetRotationY = 0;
			var targetRotationX = 0;
			var rad = 700;
			var mouse = {x:0,y:0};
			var mouseX = 0;
			var mouseY = 0;
      var w,h,w2,h2;
  // end of them

  var _this = BE;
  var t = THREE;
      //p = Physijs;
  var ASPECT = window.innerWidth / window.innerHeight;
  var MOVESPEED = 400, ACTUAL_LOOK_SPEED = 0.1;

  _this.books = [];
  _this.loaded_models = [];

  _this.init = function() {
    $('#loading').html('');
    if(!Detector.webgl) {
       Detector.addGetWebGLMessage(document.body);
       console.log('Could not detect WebGL. Quitting!');
       return;
    }

    // configure Physijs
    //Physijs.scripts.worker = 'js/lib/physijs_worker.js';
    //Physijs.scripts.ammo = 'ammo.js';

    //this.loadBooks();
    this.loadModels();
  };

  _this.loadModels = function() {
    new t.JSONLoader().load('models/table.js', function(geometry) {
      var mesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial());
      mesh.scale.set(150, 150, 150);
      _this.loaded_models.push(mesh);
      _this.setup();
      _this.initFlipBook();
    });
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

    this.cam = new t.PerspectiveCamera(50, ASPECT, 0.01, 3000);
    //this.cam  = t.Object3D._threexDomEvent.camera(this.cam);

    //this.scene = new p.Scene;
    this.scene = new t.Scene();
    this.scene.add(this.cam);
    this.cam.position.set(30, 500, 1000);

    this.controls = new t.FirstPersonControls(this.cam);
    this.controls.movementSpeed = MOVESPEED;

    this.light = new t.AmbientLight(0x404040);
    this.scene.add(this.light);

    this.projector = new t.Projector();

    for(var i in this.loaded_models) {
      this.scene.add(this.loaded_models[i]);
    }

    this.persp = false;

    this.renderer = new t.WebGLRenderer({antialias: true});
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    document.body.appendChild(this.renderer.domElement);

    /* necessary event listeners */
    function bind(scope, fn) {
      return function() {
        fn.apply(scope, arguments);
      }
    }


    /* code for perspective view for the book */

    w = window.innerWidth;
		h = window.innerHeight;
		w2 = w / 2;
		h2 = h / 2;

    function onDocumentMouseDown(event) {
        _this.persp = true;
				event.preventDefault();
				mouseX = ((event.clientX / w) * 2 - 1);
				targetRotationY = mouseY;
				mouseY = ((event.clientY / h) * 2 - 1);
				targetRotationX = mouseX;
				_this.renderer.domElement.addEventListener('mousemove', onDocumentMouseMove, false);
				_this.renderer.domElement.addEventListener('mousedown', onDocumentMouseUp, false);
				//_this.renderer.domElement.addEventListener('mouseout', onDocumentMouseOut, false);
        _this.scene.remove(_this.loaded_models[0]);
        _this.book.scale.set(2,2,2);
        _this.book.position.set(0, 500, -200);
			}

			function onDocumentMouseMove(event) {
				/*mouseX = event.clientX - w2;
				mouseY = event.clientY - h2;

				targetRotationY = targetRotationOnMouseDownY + (mouseX - mouseXOnMouseDown) * 0.02;
				targetRotationX = targetRotationOnMouseDownX + (mouseY - mouseYOnMouseDown) * 0.02;*/
				//var target=
				//mouse_path.push(e.seenas.ray);
				mouseX = ((event.clientX / w) * 2 - 1);
				targetRotationY = mouseY;
				mouseY = ((event.clientY / h) * 2 - 1);
				targetRotationX = mouseX;
        _this.rotateBook();
			}

			function onDocumentMouseUp(event) {
      _this.persp = false;
				_this.renderer.domElement.removeEventListener('mousemove', onDocumentMouseMove, false);
				_this.renderer.domElement.removeEventListener('mousedown', onDocumentMouseUp, false);
				//_this.renderer.domElement.removeEventListener('mouseout', onDocumentMouseOut, false);
			}

			function onDocumentMouseOut(event) {
      _this.persp = false;
				_this.renderer.domElement.removeEventListener('mousemove', onDocumentMouseMove, false);
				_this.renderer.domElement.removeEventListener('mousedown', onDocumentMouseUp, false);
				//_this.renderer.domElement.removeEventListener('mouseout', onDocumentMouseOut, false);
			}

      function onKeyUp(event) {
        if(event.keyCode == 90) { // z
          console.log('enable');
          _this.renderer.domElement.addEventListener('mousemove', onDocumentMouseMove, false);
          _this.renderer.domElement.addEventListener('mouseup', onDocumentMouseUp, false);
          _this.renderer.domElement.addEventListener('mouseout', onDocumentMouseOut, false);
        }
        else if(event.keyCode == 67) { // c
          _this.renderer.domElement.removeEventListener('mousemove', onDocumentMouseMove, false);
          _this.renderer.domElement.removeEventListener('mouseup', onDocumentMouseUp, false);
          _this.renderer.domElement.removeEventListener('mouseout', onDocumentMouseOut, false);
        }
      }
    /* end of perspective view code */

	  this.renderer.domElement.addEventListener('mousedown', onDocumentMouseDown, false);

    //this.renderer.domElement.addEventListener('mousemove', bind(this, this.onMouseMove), false);
    document.body.addEventListener('keyup', onKeyUp, false);

    this.render();
  };

  _this.rotateBook = function() {
    var multx = 0.5 * Math.PI;
		var multy = -Math.PI;
    if(_this.persp) {
      _this.book.rotation.x =  Math.sin(targetRotationY * multy) * Math.cos(targetRotationX * multx);
      _this.book.rotation.y =  Math.sin(targetRotationX * multx);
      _this.book.rotation.z =  Math.cos(targetRotationY * multy) * Math.cos(targetRotationX * multx);
    }
  };

  _this.render = function() {
    _this.fixMouseMove();
    //_this.scene.simulate(); //simulate physics
    _this.renderer.render(_this.scene, _this.cam);
    _this.controls.update(_this.clock.getDelta());
    TWEEN.update();
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
    lookpoint.addSelf(_this.cam.position); // <-- now using three.js r46
    //lookpoint.add(_this.cam.position); //https://github.com/mrdoob/three.js/wiki/Migration :r54->r55
    _this.cam.lookAt(lookpoint);
    _this.deltaX = 0;
  };

  _this.initFlipBook = function() {
    var images = [
        {f:"images/fcover.png",b:"images/pg0.jpg", hard:1},
			  {f:"images/pg1.jpg",b:"images/pg2.jpg",hard:0},
			  {f:"images/pg3.jpg", b:"images/pg4.jpg" ,hard:0},
			  //{f:"img/catalog_11.jpg" ,b:"img/catalog_12.jpg", hard:0},
			  //{f:"img/catalog_09.jpg", b:"img/catalog_07.jpg", hard:0},
			  //{f:"img/catalog_06.jpg", b:"img/catalog_01.jpg", hard:0},
			  {f:"images/pg5.jpg", b:"images/bcover.png",hard:1}
      ];
			//var book;
			var pagew = 200, pageh = pagew * 10 / 7;

      this.book = new FlipBook3D.Book();
      this.book.pageWidth = pagew;
      this.book.pageHeight = pageh;
      this.book.position.y = 310;
      this.book.rotation.set(-1.57, 0, 0);
      this.scene.add(this.book);
      for(var i=0; i<images.length; i++) {
        var texturefront = THREE.ImageUtils.loadTexture(images[i].f);
        var textureback = THREE.ImageUtils.loadTexture(images[i].b);
        this.book.addPage(texturefront, textureback, images[i].hard);
      }
      // event listeners for flipping page
      fl = document.getElementById('flipleft');
      fr = document.getElementById('flipright');
      fl.addEventListener('click', function() {
        console.log(_this.book);
        var idx = _this.book.pages.length - _this.book.flippedright;
        _this.book.pages[idx].flipLeft();
      });
      fr.addEventListener('click', function() {
        _this.book.pages[_this.book.flippedleft-1].flipRight();
      });
  };

})(BE);
