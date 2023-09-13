

/*
 * lightgl.js
 * http://github.com/evanw/lightgl.js/
 *
 * Copyright 2011 Evan Wallace
 * Released under the MIT license
 */
var GL = (function() {


/*
    NOTES (added by Almar)

    1. I built this from the repo myself (python).
    2. Removed all the things I don't need (exception handling and checking features that are available on browsers since forever).
    3. Added two mesh functions to create:
        3.a) billboards (full control of uv, width and height),
        3.b) "cubes" (you only define on which "row" the uv's are, but can define each one of the 6 sides you need, in any combination).
    4. Added somewhere lock pointer control.
    5. Added somewhere touch support for mobile, but discarded later on (PC only, sorry).
    6. I like 4 spaces as tabs. He liked 2. On the parts of code that I changed you will find 4 spaces, everything else is a mess :D 
    7. I'm leaving the original comments since I think they are useful.
    8. Some parts are heavily commented because I wasn't (still aren't) sure if I will use them or not.
*/


// The internal `gl` variable holds the current WebGL context.
var gl;

var GL = 
{
  // ### Initialization
  //
  // `GL.create()` creates a new WebGL context and augments it with more
  // methods. The alpha channel is disabled by default because it usually causes
  // unintended transparencies in the canvas.
  create: function(options) 
  {
    options = options || {};
    var canvas = document.createElement('canvas');
    canvas.width = 800;  // wtf
    canvas.height = 600;
    if(!('alpha' in options)) options.alpha = false;
    try { gl = canvas.getContext('webgl', options); } catch (e) {}
    try { gl = gl || canvas.getContext('experimental-webgl', options); } catch (e) {}
    if (!gl) throw new Error('WebGL not supported');
    //gl.HALF_FLOAT_OES = 0x8D61; // ???

    // mouse capture. todo: make sure when we are in fullscreen mode and when we aren't...
    canvas.addEventListener("click", async () => {
        await canvas.requestPointerLock();
    });


    addMatrixStack();
    //addImmediateMode(); // BRING THIS BACK IF NEEDED
    addEventListeners();
    addOtherMethods();
    return gl;
  },

  // `GL.keys` contains a mapping of key codes to booleans indicating whether
  // that key is currently pressed.
  keys: {},

  // Export all external classes.
  Matrix: Matrix,
  //Indexer: Indexer,
  Buffer: Buffer,
  Mesh: Mesh,
  //HitTest: HitTest,
  //Raytracer: Raytracer,
  Shader: Shader,
  Texture: Texture,
  Vector: Vector
};

// ### Matrix stack
//
// Implement the OpenGL modelview and projection matrix stacks, along with some
// other useful GLU matrix functions.

function addMatrixStack() 
{
  gl.MODELVIEW = ENUM | 1;
  gl.PROJECTION = ENUM | 2;
  var tempMatrix = new Matrix();
  var resultMatrix = new Matrix();
  gl.modelviewMatrix = new Matrix();
  gl.projectionMatrix = new Matrix();
  var modelviewStack = [];
  var projectionStack = [];
  var matrix, stack;
  gl.matrixMode = function(mode) {
    switch (mode) {
      case gl.MODELVIEW:
        matrix = 'modelviewMatrix';
        stack = modelviewStack;
        break;
      case gl.PROJECTION:
        matrix = 'projectionMatrix';
        stack = projectionStack;
        break;
      default:
        throw new Error('invalid matrix mode ' + mode);
    }
  };
  gl.loadIdentity = function() {
    Matrix.identity(gl[matrix]);
  };
  gl.loadMatrix = function(m) {
    var from = m.m, to = gl[matrix].m;
    for (var i = 0; i < 16; i++) {
      to[i] = from[i];
    }
  };
  gl.multMatrix = function(m) {
    gl.loadMatrix(Matrix.multiply(gl[matrix], m, resultMatrix));
  };
  gl.perspective = function(fov, aspect, near, far) {
    gl.multMatrix(Matrix.perspective(fov, aspect, near, far, tempMatrix));
  };

  gl.scale = function(x, y, z) {
    gl.multMatrix(Matrix.scale(x, y, z, tempMatrix));
  };
  gl.translate = function(x, y, z) {
    gl.multMatrix(Matrix.translate(x, y, z, tempMatrix));
  };
  gl.rotate = function(a, x, y, z) {
    gl.multMatrix(Matrix.rotate(a, x, y, z, tempMatrix));
  };


  gl.pushMatrix = function() {
    stack.push(Array.prototype.slice.call(gl[matrix].m));
  };
  gl.popMatrix = function() {
    var m = stack.pop();
    gl[matrix].m = /*hasFloat32Array ?*/ new Float32Array(m); // : m;
  };

  gl.matrixMode(gl.MODELVIEW); // perhaps shorten this up?
}


// ### Immediate mode
//
// Provide an implementation of OpenGL's deprecated immediate mode. This is
// depricated for a reason: constantly re-specifying the geometry is a bad
// idea for performance. You should use a `GL.Mesh` instead, which specifies
// the geometry once and caches it on the graphics card. Still, nothing
// beats a quick `gl.begin(gl.POINTS); gl.vertex(1, 2, 3); gl.end();` for
// debugging. This intentionally doesn't implement fixed-function lighting
// because it's only meant for quick debugging tasks.



// ### Improved mouse events
//
// This adds event listeners on the `gl.canvas` element that call
// `gl.onmousedown()`, `gl.onmousemove()`, and `gl.onmouseup()` with an
// augmented event object. The event object also has the properties `x`, `y`,
// `deltaX`, `deltaY`, and `dragging`.
function addEventListeners() 
{
  var context = gl, oldX = 0, oldY = 0, buttons = {}, hasOld = false;
  var has = Object.prototype.hasOwnProperty;
  function isDragging() {
    for (var b in buttons) {
      if (has.call(buttons, b) && buttons[b]) return true;
    }
    return false;
  }
  function augment(original) {
    // Make a copy of original, a native `MouseEvent`, so we can overwrite
    // WebKit's non-standard read-only `x` and `y` properties (which are just
    // duplicates of `pageX` and `pageY`). We can't just use
    // `Object.create(original)` because some `MouseEvent` functions must be
    // called in the context of the original event object.
    var e = {};
    for (var name in original) {
      if (typeof original[name] == 'function') {
        e[name] = (function(callback) {
          return function() {
            callback.apply(original, arguments);
          };
        })(original[name]);
      } else {
        e[name] = original[name];
      }
    }


    //  ADDING TOUCH SUPPORT
    if(e.touches && e.touches[0]) 
    {
        e.x = e.touches[0].pageX;
        e.y = e.touches[0].pageY;

        e.mx = 0.0;
        e.my = 0.0;
    }
    else 
    {
        e.x = e.pageX;
        e.y = e.pageY;
        
        e.mx = e.movementX;
        e.my = e.movementY;
    }

    e.original = original;



    for (var obj = gl.canvas; obj; obj = obj.offsetParent) {
      e.x -= obj.offsetLeft;
      e.y -= obj.offsetTop;
    }
    if (hasOld) {
      e.deltaX = e.x - oldX;
      e.deltaY = e.y - oldY;
    } else {
      e.deltaX = 0;
      e.deltaY = 0;
      hasOld = true;
    }
    oldX = e.x;
    oldY = e.y;
    e.dragging = isDragging();
    e.preventDefault = function() {
      e.original.preventDefault();
    };
    e.stopPropagation = function() {
      e.original.stopPropagation();
    };
    return e;
  }

  function mousedown(e) {
    gl = context;
    if (!isDragging()) {
      // Expand the event handlers to the document to handle dragging off canvas.
      on(document, 'mousemove', mousemove);
      on(document, 'mouseup', mouseup);
      off(gl.canvas, 'mousemove', mousemove);
      off(gl.canvas, 'mouseup', mouseup);
    }
    buttons[e.which] = true;
    e = augment(e);
    if (gl.onmousedown) gl.onmousedown(e);
    e.preventDefault();
  }


  function mousemove(e) {
    gl = context;
    e = augment(e);
    if (gl.onmousemove) gl.onmousemove(e);
    e.preventDefault();
  }


  function mouseup(e) {
    gl = context;
    buttons[e.which] = false;
    if (!isDragging()) {
      // Shrink the event handlers back to the canvas when dragging ends.
      off(document, 'mousemove',    mousemove);
      off(document, 'mouseup',      mouseup);
      off(document, 'touchmove',    mousemove);
      off(document, 'touchend',     mouseup);


      on(gl.canvas, 'mousemove',    mousemove);
      on(gl.canvas, 'mouseup',      mouseup);
      on(gl.canvas, 'touchmove',    mousemove);
      on(gl.canvas, 'touchend',     mouseup);

    }
    e = augment(e);
    if (gl.onmouseup) gl.onmouseup(e);
    e.preventDefault();
  }
  function reset() {
    hasOld = false;
  }


  function resetAll() 
  {
    buttons = {};
    hasOld = false;
  }


  on(gl.canvas, 'mousedown', mousedown);
  on(gl.canvas, 'mousemove', mousemove);
  on(gl.canvas, 'mouseup', mouseup);
  on(gl.canvas, 'mouseover', reset);
  on(gl.canvas, 'mouseout', reset);


  // adding tap / touch support
  on(gl.canvas, 'touchstart',   mousedown);
  on(gl.canvas, 'touchmove',    mousemove);  
  on(gl.canvas, 'touchend',     mouseup);
  on(gl.canvas, 'touchcancel',  mouseup);
  //on(gl.canvas, 'mouseover', reset);
  //on(gl.canvas, 'mouseout', reset);

  on(document, 'contextmenu', resetAll);
}

// ### Automatic keyboard state
//
// The current keyboard state is stored in `GL.keys`, a map of integer key
// codes to booleans indicating whether that key is currently pressed. Certain
// keys also have named identifiers that can be used directly, such as
// `GL.keys.SPACE`. Values in `GL.keys` are initially undefined until that
// key is pressed for the first time. If you need a boolean value, you can
// cast the value to boolean by applying the not operator twice (as in
// `!!GL.keys.SPACE`).

function mapKeyCode(code) {

    // BRING THEM BACK LATER ON IF NEEDED !!!!!!!!!!!!
  var named = 
  {
    //8: 'BACKSPACE',
    //9: 'TAB',
    //13: 'ENTER',
    //16: 'SHIFT',
    //27: 'ESCAPE',
    32: 'SPACE',
    37: 'LEFT',
    38: 'UP',
    39: 'RIGHT',
    40: 'DOWN'
  };
  return named[code] || (code >= 65 && code <= 90 ? String.fromCharCode(code) : null);
}

function on(element, name, callback) {
  element.addEventListener(name, callback);
}

function off(element, name, callback) {
  element.removeEventListener(name, callback);
}

on(document, 'keydown', function(e) {
  if (!e.altKey && !e.ctrlKey && !e.metaKey) {
    var key = mapKeyCode(e.keyCode);
    if (key) GL.keys[key] = true;
    GL.keys[e.keyCode] = true;
  }
});

on(document, 'keyup', function(e) {
  if (!e.altKey && !e.ctrlKey && !e.metaKey) {
    var key = mapKeyCode(e.keyCode);
    if (key) GL.keys[key] = false;
    GL.keys[e.keyCode] = false;
  }
});




function addOtherMethods() {
  // ### Multiple contexts
  //
  // When using multiple contexts in one web page, `gl.makeCurrent()` must be
  // called before issuing commands to a different context.

  // ### Animation
  //
  // Call `gl.animate()` to provide an animation loop that repeatedly calls
  // `gl.onupdate()` and `gl.ondraw()`.
  gl.animate = function() {
    //var post =
      //window.requestAnimationFrame; // ||
      ////window.mozRequestAnimationFrame ||
      ////window.webkitRequestAnimationFrame ||
      ////function(callback) { setTimeout(callback, 1000 / 60); };
    var time = new Date().getTime();
    var context = gl;
    function update() {
      gl = context;
      var now = new Date().getTime();
      if (gl.onupdate) gl.onupdate((now - time) / 1000);
      if (gl.ondraw) gl.ondraw();
      //post(update);

      window.requestAnimationFrame(update);
      time = now;
    }
    update();
  };



  // ### Fullscreen
  //
  // Provide an easy way to get a fullscreen app running, including an
  // automatic 3D perspective projection matrix by default. This should be
  // called once.
  //
  // Just fullscreen, no automatic camera:
  //
  //     gl.fullscreen({ camera: false });
  //
  // Adjusting field of view, near plane distance, and far plane distance:
  //
  //     gl.fullscreen({ fov: 45, near: 0.1, far: 1000 });
  //
  // Adding padding from the edge of the window:
  //
  //     gl.fullscreen({ paddingLeft: 250, paddingBottom: 60 });
  //
  gl.fullscreen = function(options) {
    options = options || {};
    var top = options.paddingTop || 0;
    var left = options.paddingLeft || 0;
    var right = options.paddingRight || 0;
    var bottom = options.paddingBottom || 0;
    //if (!document.body) {
    //  throw new Error('no body oops');
    //}
    document.body.appendChild(gl.canvas);
    document.body.style.overflow = 'hidden';
    gl.canvas.style.position = 'absolute';
    gl.canvas.style.left = left + 'px';
    gl.canvas.style.top = top + 'px';
    function resize() {
      gl.canvas.width = window.innerWidth - left - right;
      gl.canvas.height = window.innerHeight - top - bottom;
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
      if (options.camera || !('camera' in options)) {
        gl.matrixMode(gl.PROJECTION);
        gl.loadIdentity();
        gl.perspective(options.fov || 90 /*45*/, gl.canvas.width / gl.canvas.height, options.near || 0.01, options.far || 1000);
        gl.matrixMode(gl.MODELVIEW);
      }
      if (gl.ondraw) gl.ondraw();
    }
    on(window, 'resize', resize);
    resize();
  };
}

// A value to bitwise-or with new enums to make them distinguishable from the
// standard WebGL enums.
var ENUM = 0x12340000; // ???

// src/matrix.js
// Represents a 4x4 matrix stored in row-major order that uses Float32Arrays
// when available. Matrix operations can either be done using convenient
// methods that return a new matrix for the result or optimized methods
// that store the result in an existing matrix to avoid generating garbage.

//var hasFloat32Array = (typeof Float32Array != 'undefined');  // do we need this?

// ### new GL.Matrix([elements])
//
// This constructor takes 16 arguments in row-major order, which can be passed
// individually, as a list, or even as four lists, one for each row. If the
// arguments are omitted then the identity matrix is constructed instead.
function Matrix() {
  var m = Array.prototype.concat.apply([], arguments);
  if (!m.length) {
    m = [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ];
  }
  this.m = /*hasFloat32Array ?*/ new Float32Array(m); // : m; // we assume we all have it...
}

Matrix.prototype = {

  // ### .multiply(matrix)
  //
  // Returns the concatenation of the transforms for this matrix and `matrix`.
  // This emulates the OpenGL function `glMultMatrix()`.
  multiply: function(matrix) {
    return Matrix.multiply(this, matrix, new Matrix());
  }

};


// ### GL.Matrix.multiply(left, right[, result])
//
// Returns the concatenation of the transforms for `left` and `right`. You can
// optionally pass an existing matrix in `result` to avoid allocating a new
// matrix. This emulates the OpenGL function `glMultMatrix()`.
Matrix.multiply = function(left, right, result) {
  result = result || new Matrix();
  var a = left.m, b = right.m, r = result.m;

  r[0] = a[0] * b[0] + a[1] * b[4] + a[2] * b[8] + a[3] * b[12];
  r[1] = a[0] * b[1] + a[1] * b[5] + a[2] * b[9] + a[3] * b[13];
  r[2] = a[0] * b[2] + a[1] * b[6] + a[2] * b[10] + a[3] * b[14];
  r[3] = a[0] * b[3] + a[1] * b[7] + a[2] * b[11] + a[3] * b[15];

  r[4] = a[4] * b[0] + a[5] * b[4] + a[6] * b[8] + a[7] * b[12];
  r[5] = a[4] * b[1] + a[5] * b[5] + a[6] * b[9] + a[7] * b[13];
  r[6] = a[4] * b[2] + a[5] * b[6] + a[6] * b[10] + a[7] * b[14];
  r[7] = a[4] * b[3] + a[5] * b[7] + a[6] * b[11] + a[7] * b[15];

  r[8] = a[8] * b[0] + a[9] * b[4] + a[10] * b[8] + a[11] * b[12];
  r[9] = a[8] * b[1] + a[9] * b[5] + a[10] * b[9] + a[11] * b[13];
  r[10] = a[8] * b[2] + a[9] * b[6] + a[10] * b[10] + a[11] * b[14];
  r[11] = a[8] * b[3] + a[9] * b[7] + a[10] * b[11] + a[11] * b[15];

  r[12] = a[12] * b[0] + a[13] * b[4] + a[14] * b[8] + a[15] * b[12];
  r[13] = a[12] * b[1] + a[13] * b[5] + a[14] * b[9] + a[15] * b[13];
  r[14] = a[12] * b[2] + a[13] * b[6] + a[14] * b[10] + a[15] * b[14];
  r[15] = a[12] * b[3] + a[13] * b[7] + a[14] * b[11] + a[15] * b[15];

  return result;
};

// ### GL.Matrix.identity([result])
//
// Returns an identity matrix. You can optionally pass an existing matrix in
// `result` to avoid allocating a new matrix. This emulates the OpenGL function
// `glLoadIdentity()`.
Matrix.identity = function(result) {
  result = result || new Matrix();
  var m = result.m;
  m[0] = m[5] = m[10] = m[15] = 1;
  m[1] = m[2] = m[3] = m[4] = m[6] = m[7] = m[8] = m[9] = m[11] = m[12] = m[13] = m[14] = 0;
  return result;
};

// ### GL.Matrix.perspective(fov, aspect, near, far[, result])
//
// Returns a perspective transform matrix, which makes far away objects appear
// smaller than nearby objects. The `aspect` argument should be the width
// divided by the height of your viewport and `fov` is the top-to-bottom angle
// of the field of view in degrees. You can optionally pass an existing matrix
// in `result` to avoid allocating a new matrix. This emulates the OpenGL
// function `gluPerspective()`.
Matrix.perspective = function(fov, aspect, near, far, result) {
  var y = Math.tan(fov * Math.PI / 360) * near;
  var x = y * aspect;
  return Matrix.frustum(-x, x, -y, y, near, far, result);
};

// ### GL.Matrix.frustum(left, right, bottom, top, near, far[, result])
//
// Sets up a viewing frustum, which is shaped like a truncated pyramid with the
// camera where the point of the pyramid would be. You can optionally pass an
// existing matrix in `result` to avoid allocating a new matrix. This emulates
// the OpenGL function `glFrustum()`.
Matrix.frustum = function(l, r, b, t, n, f, result) {
  result = result || new Matrix();
  var m = result.m;

  m[0] = 2 * n / (r - l);
  m[1] = 0;
  m[2] = (r + l) / (r - l);
  m[3] = 0;

  m[4] = 0;
  m[5] = 2 * n / (t - b);
  m[6] = (t + b) / (t - b);
  m[7] = 0;

  m[8] = 0;
  m[9] = 0;
  m[10] = -(f + n) / (f - n);
  m[11] = -2 * f * n / (f - n);

  m[12] = 0;
  m[13] = 0;
  m[14] = -1;
  m[15] = 0;

  return result;
};


// ### GL.Matrix.scale(x, y, z[, result])
//
// This emulates the OpenGL function `glScale()`. You can optionally pass an
// existing matrix in `result` to avoid allocating a new matrix.
Matrix.scale = function(x, y, z, result) {
  result = result || new Matrix();
  var m = result.m;

  m[0] = x;
  m[1] = 0;
  m[2] = 0;
  m[3] = 0;

  m[4] = 0;
  m[5] = y;
  m[6] = 0;
  m[7] = 0;

  m[8] = 0;
  m[9] = 0;
  m[10] = z;
  m[11] = 0;

  m[12] = 0;
  m[13] = 0;
  m[14] = 0;
  m[15] = 1;

  return result;
};

// ### GL.Matrix.translate(x, y, z[, result])
//
// This emulates the OpenGL function `glTranslate()`. You can optionally pass
// an existing matrix in `result` to avoid allocating a new matrix.
Matrix.translate = function(x, y, z, result) {
  result = result || new Matrix();
  var m = result.m;

  m[0] = 1;
  m[1] = 0;
  m[2] = 0;
  m[3] = x;

  m[4] = 0;
  m[5] = 1;
  m[6] = 0;
  m[7] = y;

  m[8] = 0;
  m[9] = 0;
  m[10] = 1;
  m[11] = z;

  m[12] = 0;
  m[13] = 0;
  m[14] = 0;
  m[15] = 1;

  return result;
};

// ### GL.Matrix.rotate(a, x, y, z[, result])
//
// Returns a matrix that rotates by `a` degrees around the vector `x, y, z`.
// You can optionally pass an existing matrix in `result` to avoid allocating
// a new matrix. This emulates the OpenGL function `glRotate()`.
Matrix.rotate = function(a, x, y, z, result) {
  if (!a || (!x && !y && !z)) {
    return Matrix.identity(result);
  }

  result = result || new Matrix();
  var m = result.m;

  var d = Math.sqrt(x*x + y*y + z*z);
  a *= Math.PI / 180; x /= d; y /= d; z /= d;
  var c = Math.cos(a), s = Math.sin(a), t = 1 - c;

  m[0] = x * x * t + c;
  m[1] = x * y * t - z * s;
  m[2] = x * z * t + y * s;
  m[3] = 0;

  m[4] = y * x * t + z * s;
  m[5] = y * y * t + c;
  m[6] = y * z * t - x * s;
  m[7] = 0;

  m[8] = z * x * t - y * s;
  m[9] = z * y * t + x * s;
  m[10] = z * z * t + c;
  m[11] = 0;

  m[12] = 0;
  m[13] = 0;
  m[14] = 0;
  m[15] = 1;

  return result;
};



// src/mesh.js
// Represents indexed triangle geometry with arbitrary additional attributes.
// You need a shader to draw a mesh; meshes can't draw themselves.
//
// A mesh is a collection of `GL.Buffer` objects which are either vertex buffers
// (holding per-vertex attributes) or index buffers (holding the order in which
// vertices are rendered). By default, a mesh has a position vertex buffer called
// `vertices` and a triangle index buffer called `triangles`. New buffers can be
// added using `addVertexBuffer()` and `addIndexBuffer()`. Two strings are
// required when adding a new vertex buffer, the name of the data array on the
// mesh instance and the name of the GLSL attribute in the vertex shader.
//
// Example usage:
//
//     var mesh = new GL.Mesh({ coords: true, lines: true });
//
//     // Default attribute "vertices", available as "gl_Vertex" in
//     // the vertex shader
//     mesh.vertices = [[0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 1, 0]];
//
//     // Optional attribute "coords" enabled in constructor,
//     // available as "gl_TexCoord" in the vertex shader
//     mesh.coords = [[0, 0], [1, 0], [0, 1], [1, 1]];
//
//     // Custom attribute "weights", available as "weight" in the
//     // vertex shader
//     mesh.addVertexBuffer('weights', 'weight');
//     mesh.weights = [1, 0, 0, 1];
//
//     // Default index buffer "triangles"
//     mesh.triangles = [[0, 1, 2], [2, 1, 3]];
//
//     // Optional index buffer "lines" enabled in constructor
//     mesh.lines = [[0, 1], [0, 2], [1, 3], [2, 3]];
//
//     // Upload provided data to GPU memory
//     mesh.compile();




// ### new GL.Buffer(target, type)
//
// Provides a simple method of uploading data to a GPU buffer. Example usage:
//
//     var vertices = new GL.Buffer(gl.ARRAY_BUFFER, Float32Array);
//     var indices = new GL.Buffer(gl.ELEMENT_ARRAY_BUFFER, Uint16Array);
//     vertices.data = [[0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 1, 0]];
//     indices.data = [[0, 1, 2], [2, 1, 3]];
//     vertices.compile();
//     indices.compile();
//
function Buffer(target, type) {
  this.buffer = null;
  this.target = target;
  this.type = type;
  this.data = [];
}

Buffer.prototype = {
  // ### .compile(type)
  //
  // Upload the contents of `data` to the GPU in preparation for rendering. The
  // data must be a list of lists where each inner list has the same length. For
  // example, each element of data for vertex normals would be a list of length three.
  // This will remember the data length and element length for later use by shaders.
  // The type can be either `gl.STATIC_DRAW` or `gl.DYNAMIC_DRAW`, and defaults to
  // `gl.STATIC_DRAW`.
  //
  // This could have used `[].concat.apply([], this.data)` to flatten
  // the array but Google Chrome has a maximum number of arguments so the
  // concatenations are chunked to avoid that limit.
  compile: function(type) {
    var data = [];
    for (var i = 0, chunk = 10000; i < this.data.length; i += chunk) {
      data = Array.prototype.concat.apply(data, this.data.slice(i, i + chunk));
    }
    var spacing = this.data.length ? data.length / this.data.length : 0;
    if (spacing != Math.round(spacing)) throw new Error('buffer elements not of consistent size, average size is ' + spacing);
    this.buffer = this.buffer || gl.createBuffer();
    this.buffer.length = data.length;
    this.buffer.spacing = spacing;
    gl.bindBuffer(this.target, this.buffer);
    gl.bufferData(this.target, new this.type(data), type || 35044 /*gl.STATIC_DRAW*/);
  }
};

// ### new GL.Mesh([options])
//
// Represents a collection of vertex buffers and index buffers. Each vertex
// buffer maps to one attribute in GLSL and has a corresponding property set
// on the Mesh instance. There is one vertex buffer by default: `vertices`,
// which maps to `gl_Vertex`. The `coords`, `normals`, and `colors` vertex
// buffers map to `gl_TexCoord`, `gl_Normal`, and `gl_Color` respectively,
// and can be enabled by setting the corresponding options to true. There are
// two index buffers, `triangles` and `lines`, which are used for rendering
// `gl.TRIANGLES` and `gl.LINES`, respectively. Only `triangles` is enabled by
// default, although `computeWireframe()` will add a normal buffer if it wasn't
// initially enabled.
function Mesh(options) {
  options = options || {};
  this.vertexBuffers = {};
  this.indexBuffers = {};
  this.addVertexBuffer('vertices', 'gl_Vertex');
  if (options.coords) this.addVertexBuffer('coords', 'gl_TexCoord');
  if (options.normals) this.addVertexBuffer('normals', 'gl_Normal');
  if (options.colors) this.addVertexBuffer('colors', 'gl_Color');
  if (!('triangles' in options) || options.triangles) this.addIndexBuffer('triangles');
  if (options.lines) this.addIndexBuffer('lines');
}

Mesh.prototype = {
  // ### .addVertexBuffer(name, attribute)
  //
  // Add a new vertex buffer with a list as a property called `name` on this object
  // and map it to the attribute called `attribute` in all shaders that draw this mesh.
  addVertexBuffer: function(name, attribute) {
    var buffer = this.vertexBuffers[attribute] = new Buffer(34962 /*gl.ARRAY_BUFFER*/, Float32Array);
    buffer.name = name;
    this[name] = [];
  },

  // ### .addIndexBuffer(name)
  //
  // Add a new index buffer with a list as a property called `name` on this object.
  addIndexBuffer: function(name) {
    var buffer = this.indexBuffers[name] = new Buffer(34963 /*gl.ELEMENT_ARRAY_BUFFER*/, Uint16Array);
    this[name] = [];
  },

  // ### .compile()
  //
  // Upload all attached buffers to the GPU in preparation for rendering. This
  // doesn't need to be called every frame, only needs to be done when the data
  // changes.
  compile: function() {
    for (var attribute in this.vertexBuffers) {
      var buffer = this.vertexBuffers[attribute];
      buffer.data = this[buffer.name];
      buffer.compile();
    }

    for (var name in this.indexBuffers) {
      var buffer = this.indexBuffers[name];
      buffer.data = this[name];
      buffer.compile();
    }
  }
};






// bd = billboard - s,t,u,v - texturing (probably got the names wrong). sx/sy: the "scale" (width vs height)
Mesh.bd = function(s, t, u, v, sx, sy)
{
  var m = new Mesh({ coords: true /*, normals: true*/ });
  sx = sx || 1.0;
  sy = sy || 1.0;

  s /= 128.0;
  t /= 128.0;
  u /= 128.0;
  v /= 128.0;

  m.vertices   = [ [-1 * sx, -1 * sy, 0], [1 * sx, -1 * sy, 0], [-1 * sx, 1 * sy, 0], [1 * sx, 1 * sy, 0] ];  // XY PLANE (looking at the player)
  //mesh.normals    = [ [0,0,1], [0,0,1], [0,0,1], [0,0,1] ]; // XY PLANE (looking forward)  // we don't need normals!
  m.coords      = [ [s, t], [u, t], [s, v], [u, v] ];  
  m.triangles  = [ [0, 1, 2], [2, 1, 3] ];
  m.compile();
  return m;
};



// a box (lol)
// this allows you to specify individual planes (or combinations of them) using the same row approach for texturing
// we assume you define at least one of them lol
Mesh.bo = function(row, cfg) //s, t, u, v, sx, sy) 
{    
    row = row || 0;

    var m = new Mesh({ coords: true }), //, normals: true }); // perhaps we don't need normals?
        g = cfg.includes("G"),
        c = cfg.includes("C"),
        b = cfg.includes("B"),
        l = cfg.includes("L"),
        r = cfg.includes("R"),
        f = cfg.includes("F"),
        t = (128.0 - (16.0 * row)) / 128.0,
        s = t - (16.0 / 128.0);
        u = t;

    t = s;
    s = u;
    //console.log("wtf ", row, s, t)

    m.vertices      = [];
    m.coords        = [];
    m.triangles     = [];

    // 16           / 128 = 0.125
    // (16 + 16)    / 128 = 0.25
    // (32 + 32)    / 128 = 0.5
    // (64 + 32)    / 128 = 0.75
    // (96 + 32)    / 128 = 1


    if(g)
    {
        m.vertices.push(    [-1,0,-1],  [ 1, 0,-1],  [-1, 0, 1],  [ 1, 0, 1]    ); // ground G 
        m.coords.push(      [0, s],     [0.125, s],  [0, t],      [0.125, t]    );
    }
    if(c)
    { 
        m.vertices.push(    [-1,1,-1],  [ 1, 1,-1],  [-1, 1, 1],  [ 1, 1, 1]    ); // ceiling  C
        m.coords.push(      [0.125, s], [0.25,  s],  [0.125, t],  [0.25,  t]    );
    }
    if(b)
    {
        m.vertices.push(    [-1,0,-1],  [ 1, 0,-1],  [-1, 1,-1],  [ 1, 1,-1]    ); // back     B
        m.coords.push(      [0.25, s],  [0.5,   s],  [0.25,  t],  [0.5,   t]    );
    }
    if(l)
    {
        m.vertices.push(    [-1,0,-1],  [-1, 0, 1],  [-1, 1,-1],  [-1, 1, 1]    ); // left     L
        m.coords.push(      [0.5,  s],  [0.75,  s],  [0.5,   t],  [0.75,  t]    );
    }
    if(r)
    {
        m.vertices.push(    [ 1,0,-1],  [ 1, 0, 1],  [ 1, 1,-1],  [ 1, 1, 1]    ); // right    R
        m.coords.push(      [0.75, s],  [1,  s],     [0.75,  t],  [1,     t]    );
    }
    if(f)
    {
        m.vertices.push(    [-1,0, 1],  [ 1, 0, 1],  [-1, 1, 1],  [ 1, 1, 1]    ); // front     F
        m.coords.push(      [1,    s],  [0.75,  s],  [1,     t],  [0.75,  t]    );
    }

    // stride
    var de = 0;
    for(var i = 0; i < cfg.length; i++)
    {
        de = i * 4;
        m.triangles.push(   [0 + de, 1 + de, 2 + de], [2 + de, 1 + de, 3 + de]   );
    }

    //console.log("box test: ", m);
    m.compile();
    return m;
};



// src/shader.js
// Provides a convenient wrapper for WebGL shaders. A few uniforms and attributes,
// prefixed with `gl_`, are automatically added to all shader sources to make
// simple shaders easier to write.
//
// Example usage:
//
//     var shader = new GL.Shader('\
//       void main() {\
//         gl_Position = gl_ModelViewProjectionMatrix * gl_Vertex;\
//       }\
//     ', '\
//       uniform vec4 color;\
//       void main() {\
//         gl_FragColor = color;\
//       }\
//     ');
//
//     shader.uniforms({
//       color: [1, 0, 0, 1]
//     }).draw(mesh);

function regexMap(regex, text, callback) {
  while ((result = regex.exec(text)) != null) {
    callback(result);
  }
}

// Non-standard names beginning with `gl_` must be mangled because they will
// otherwise cause a compiler error.
var LIGHTGL_PREFIX = 'LIGHTGL';

// ### new GL.Shader(vertexSource, fragmentSource)
//
// Compiles a shader program using the provided vertex and fragment shaders.
function Shader(vertexSource, fragmentSource) {
  // Allow passing in the id of an HTML script tag with the source
  function followScriptTagById(id) {
    var element = document.getElementById(id);
    return element ? element.text : id;
  }
  vertexSource = followScriptTagById(vertexSource);
  fragmentSource = followScriptTagById(fragmentSource);

/*
// ORIGINAL HEADERS
  var header = '\
    uniform mat3 gl_NormalMatrix;\
    uniform mat4 gl_ModelViewMatrix;\
    uniform mat4 gl_ProjectionMatrix;\
    uniform mat4 gl_ModelViewProjectionMatrix;\
    uniform mat4 gl_ModelViewMatrixInverse;\
    uniform mat4 gl_ProjectionMatrixInverse;\
    uniform mat4 gl_ModelViewProjectionMatrixInverse;\
  ';
  var vertexHeader = header + '\
    attribute vec4 gl_Vertex;\
    attribute vec4 gl_TexCoord;\
    attribute vec3 gl_Normal;\
    attribute vec4 gl_Color;\
    vec4 ftransform() {\
      return gl_ModelViewProjectionMatrix * gl_Vertex;\
    }\
  ';
*/


  // Headers are prepended to the sources to provide some automatic functionality.
  // bring them back if we need them
  //     uniform mat3 gl_NormalMatrix;\
//    uniform mat4 gl_ModelViewMatrix;\
//    uniform mat4 gl_ProjectionMatrix;\

  var header = '\
    uniform mat4 gl_ModelViewProjectionMatrix;\
  ';

  // BRING BACK NORMAL and color IF WE NEED Them 
  //attribute vec3 gl_Normal;\
  //attribute vec4 gl_Color;\
  //
  // and we don't need ftransform because we do it anyways
  //
  //    vec4 ftransform() {\
  //    return gl_ModelViewProjectionMatrix * gl_Vertex;\
//    }\  
  var vertexHeader = header + '\
    attribute vec4 gl_Vertex;\
    attribute vec4 gl_TexCoord;\
  ';
  var fragmentHeader = '\
    precision highp float;\
  ' + header;

  // Check for the use of built-in matrices that require expensive matrix
  // multiplications to compute, and record these in `usedMatrices`.
  var source = vertexSource + fragmentSource;
  var usedMatrices = {};
  regexMap(/\b(gl_[^;]*)\b;/g, header, function(groups) {
    var name = groups[1];
    if (source.indexOf(name) != -1) {
      var capitalLetters = name.replace(/[a-z_]/g, '');
      usedMatrices[capitalLetters] = LIGHTGL_PREFIX + name;
    }
  });
  if (source.indexOf('ftransform') != -1) usedMatrices.MVPM = LIGHTGL_PREFIX + 'gl_ModelViewProjectionMatrix';
  this.usedMatrices = usedMatrices;

  // The `gl_` prefix must be substituted for something else to avoid compile
  // errors, since it's a reserved prefix. This prefixes all reserved names with
  // `_`. The header is inserted after any extensions, since those must come
  // first.
  function fix(header, source) {
    var replaced = {};
    var match = /^((\s*\/\/.*\n|\s*#extension.*\n)+)[^]*$/.exec(source);
    source = match ? match[1] + header + source.substr(match[1].length) : header + source;
    regexMap(/\bgl_\w+\b/g, header, function(result) {
      if (!(result in replaced)) {
        source = source.replace(new RegExp('\\b' + result + '\\b', 'g'), LIGHTGL_PREFIX + result);
        replaced[result] = true;
      }
    });
    return source;
  }
  vertexSource = fix(vertexHeader, vertexSource);
  fragmentSource = fix(fragmentHeader, fragmentSource);

  // Compile and link errors are thrown as strings.
  function compileSource(type, source) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      throw new Error('compile error: ' + gl.getShaderInfoLog(shader));
    }
    return shader;
  }
  this.program = gl.createProgram();
  gl.attachShader(this.program, compileSource(35633 /*gl.VERTEX_SHADER*/, vertexSource));
  gl.attachShader(this.program, compileSource(35632 /*gl.FRAGMENT_SHADER*/, fragmentSource));
  gl.linkProgram(this.program);
  if (!gl.getProgramParameter(this.program, gl.LINK_STATUS))   // :(
  {
    throw new Error('link error: ' + gl.getProgramInfoLog(this.program));
  }
  this.attributes = {};
  this.uniformLocations = {};

  // Sampler uniforms need to be uploaded using `gl.uniform1i()` instead of `gl.uniform1f()`.
  // To do this automatically, we detect and remember all uniform samplers in the source code.
  var isSampler = {};
  regexMap(/uniform\s+sampler(1D|2D|3D|Cube)\s+(\w+)\s*;/g, vertexSource + fragmentSource, function(groups) {
    isSampler[groups[2]] = 1;
  });
  this.isSampler = isSampler;
}

function isArray(obj) {
  var str = Object.prototype.toString.call(obj);
  return str == '[object Array]' || str == '[object Float32Array]';
}

function isNumber(obj) {
  var str = Object.prototype.toString.call(obj);
  return str == '[object Number]' || str == '[object Boolean]';
}

var tempMatrix = new Matrix();
var resultMatrix = new Matrix();

Shader.prototype = 
{
    // ### .uniforms(uniforms)
    //
    // Set a uniform for each property of `uniforms`. The correct `gl.uniform*()` method is
    // inferred from the value types and from the stored uniform sampler flags.
    uniforms: function(uniforms) 
    {
        gl.useProgram(this.program);

        for (var name in uniforms) 
        {
            var location = this.uniformLocations[name] || gl.getUniformLocation(this.program, name);
            if (!location) continue;
            this.uniformLocations[name] = location;
            var value = uniforms[name];
            if (value instanceof Vector) 
            {
                value = [value.x, value.y, value.z];
            }
            else if (value instanceof Matrix) 
            {
                value = value.m;
            }

            if (isArray(value)) 
            {
                switch (value.length) 
                {
                    case 1: gl.uniform1fv(location, new Float32Array(value)); break;
                    case 2: gl.uniform2fv(location, new Float32Array(value)); break;
                    case 3: gl.uniform3fv(location, new Float32Array(value)); break;
                    case 4: gl.uniform4fv(location, new Float32Array(value)); break;
                    // Matrices are automatically transposed, since WebGL uses column-major
                    // indices instead of row-major indices.
                    case 9: gl.uniformMatrix3fv(location, false, new Float32Array([
                            value[0], value[3], value[6],
                            value[1], value[4], value[7],
                            value[2], value[5], value[8]
                    ])); break;
                    case 16: gl.uniformMatrix4fv(location, false, new Float32Array([
                            value[0], value[4], value[8], value[12],
                            value[1], value[5], value[9], value[13],
                            value[2], value[6], value[10], value[14],
                            value[3], value[7], value[11], value[15]
                    ])); break;
                    default: throw new Error('don\'t know how to load uniform "' + name + '" of length ' + value.length);
                }
            }
            else if (isNumber(value)) 
            {
                (this.isSampler[name] ? gl.uniform1i : gl.uniform1f).call(gl, location, value);
            }

            // todo: remove these for the final build!
            else 
            {
                throw new Error('attempted to set uniform "' + name + '" to invalid value ' + value);
            }
        }

        return this;
    },

    // ### .draw(mesh[, mode])
    //
    // Sets all uniform matrix attributes, binds all relevant buffers, and draws the
    // mesh geometry as indexed triangles or indexed lines. Set `mode` to `gl.LINES`
    // (and either add indices to `lines` or call `computeWireframe()`) to draw the
    // mesh in wireframe.
    draw: function(mesh, mode) 
    {
        this.drawBuffers(mesh.vertexBuffers,
        mesh.indexBuffers[mode == gl.LINES ? 'lines' : 'triangles'],
        arguments.length < 2 ? gl.TRIANGLES : mode);  // we probably could simplify this bit of code and remove the lines part...
    }, 


    // ### .drawBuffers(vertexBuffers, indexBuffer, mode)
    //
    // Sets all uniform matrix attributes, binds all relevant buffers, and draws the
    // indexed mesh geometry. The `vertexBuffers` argument is a map from attribute
    // names to `Buffer` objects of type `gl.ARRAY_BUFFER`, `indexBuffer` is a `Buffer`
    // object of type `gl.ELEMENT_ARRAY_BUFFER`, and `mode` is a WebGL primitive mode
    // like `gl.TRIANGLES` or `gl.LINES`. This method automatically creates and caches
    // vertex attribute pointers for attributes as needed.
    drawBuffers: function(vertexBuffers, indexBuffer, mode) 
    {
        // Only construct up the built-in matrices we need for this shader.
        // BRING THEM BACK IF WE NEED THEM !!!!
        var used = this.usedMatrices;
        var MVM = gl.modelviewMatrix;
        var PM = gl.projectionMatrix;
//        var MVMI = (used.MVMI || used.NM) ? MVM.inverse() : null;
//        var PMI = (used.PMI) ? PM.inverse() : null;
//        var MVPM = (used.MVPM || used.MVPMI) ? PM.multiply(MVM) : null; // original

        var MVPM = used.MVPM ? PM.multiply(MVM) : null;

        var matrices = {};
//        if (used.MVM) matrices[used.MVM] = MVM;
//        if (used.MVMI) matrices[used.MVMI] = MVMI;
//        if (used.PM) matrices[used.PM] = PM;
//        if (used.PMI) matrices[used.PMI] = PMI;
        if (used.MVPM) matrices[used.MVPM] = MVPM;
//        if (used.MVPMI) matrices[used.MVPMI] = MVPM.inverse();
  
/*      
        if (used.NM) 
        {
            var m = MVMI.m;
            matrices[used.NM] = [m[0], m[4], m[8], m[1], m[5], m[9], m[2], m[6], m[10]];
        }
*/

        this.uniforms(matrices);

        // Create and enable attribute pointers as necessary.
        var length = 0;
        
        for (var attribute in vertexBuffers) 
        {
            var buffer = vertexBuffers[attribute];
            var location = this.attributes[attribute] || gl.getAttribLocation(this.program, attribute.replace(/^(gl_.*)$/, LIGHTGL_PREFIX + '$1'));
            if (location == -1 || !buffer.buffer) continue;
            this.attributes[attribute] = location;
            gl.bindBuffer(34962 /*gl.ARRAY_BUFFER*/, buffer.buffer);
            gl.enableVertexAttribArray(location);
            gl.vertexAttribPointer(location, buffer.buffer.spacing, 5126 /*gl.FLOAT*/, false, 0, 0);
            length = buffer.buffer.length / buffer.buffer.spacing;
        }

        // Disable unused attribute pointers.
        for (var attribute in this.attributes) 
        {
            if (!(attribute in vertexBuffers)) 
            {
                gl.disableVertexAttribArray(this.attributes[attribute]);
            }
        }

        // Draw the geometry.
        if (length && (!indexBuffer || indexBuffer.buffer)) 
        {
            if (indexBuffer) 
            {
                gl.bindBuffer(34963 /*gl.ELEMENT_ARRAY_BUFFER*/, indexBuffer.buffer);
                gl.drawElements(mode, indexBuffer.buffer.length, 5123 /*gl.UNSIGNED_SHORT*/, 0);
            }
            else 
            {
                gl.drawArrays(mode, 0, length);
            }
        }

        return this;
    }
};

// src/texture.js
// Provides a simple wrapper around WebGL textures that supports render-to-texture.

// ### new GL.Texture(width, height[, options])
//
// The arguments `width` and `height` give the size of the texture in texels.
// WebGL texture dimensions must be powers of two unless `filter` is set to
// either `gl.NEAREST` or `gl.LINEAR` and `wrap` is set to `gl.CLAMP_TO_EDGE`
// (which they are by default).
//
// Texture parameters can be passed in via the `options` argument.
// Example usage:
//
//     var t = new GL.Texture(256, 256, {
//       // Defaults to gl.LINEAR, set both at once with "filter"
//       magFilter: gl.NEAREST,
//       minFilter: gl.LINEAR,
//
//       // Defaults to gl.CLAMP_TO_EDGE, set both at once with "wrap"
//       wrapS: gl.REPEAT,
//       wrapT: gl.REPEAT,
//
//       format: gl.RGB, // Defaults to gl.RGBA
//       type: gl.FLOAT // Defaults to gl.UNSIGNED_BYTE
//     });

// TODO: CHECK IF WE CAN SIMPLIFY THIS CLUSTERFUCK
function Texture(width, height, options) 
{
  options = options || {};
  this.id = gl.createTexture();
  this.width = width;
  this.height = height;
  this.format = options.format || 6408 /*gl.RGBA*/;  
  this.type = options.type || 5121 /*gl.UNSIGNED_BYTE*/;


  var magFilter = options.filter || options.magFilter || 9728 /*gl.NEAREST*/; // gl.LINEAR; //
  var minFilter = options.filter || options.minFilter || 9728 /*gl.NEAREST*/; //gl.LINEAR;

  gl.bindTexture(3553 /*gl.TEXTURE_2D*/, this.id);
  gl.pixelStorei(37440 /*gl.UNPACK_FLIP_Y_WEBGL*/, 1);

  //gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true); // now we are using enable blend and it works lol

  // TODO: CHECK IF WE CAN SIMPLIFY THIS!!!
  gl.texParameteri(3553  /*gl.TEXTURE_2D*/, 10240 /*gl.TEXTURE_MAG_FILTER*/, magFilter);
  gl.texParameteri(3553  /*gl.TEXTURE_2D*/, 10241 /*gl.TEXTURE_MIN_FILTER*/, minFilter);
  gl.texParameteri(3553  /*gl.TEXTURE_2D*/, 10242 /*gl.TEXTURE_WRAP_S*/, options.wrap || options.wrapS || 33071 /*gl.CLAMP_TO_EDGE*/);  
  gl.texParameteri(3553  /*gl.TEXTURE_2D*/, 10243 /*gl.TEXTURE_WRAP_T*/, options.wrap || options.wrapT || 33071 /*gl.CLAMP_TO_EDGE*/);

  gl.texImage2D(3553 /*gl.TEXTURE_2D*/, 0, this.format, width, height, 0, this.format, this.type, options.data || null);
}

var framebuffer;
var renderbuffer;
var checkerboardCanvas;


Texture.prototype = 
{
  // ### .bind([unit])
  //
  // Bind this texture to the given texture unit (0-7, defaults to 0).
  bind: function(unit) {
    gl.activeTexture(33984 /*gl.TEXTURE0*/ + (unit || 0));
    gl.bindTexture(3553 /*gl.TEXTURE_2D*/, this.id);
  }

};






// ### GL.Texture.fromImage(image[, options])
//
// Return a new image created from `image`, an `<img>` tag.
Texture.fromImage = function(image, options) 
{
  options = options || {};
  var texture = new Texture(image.width, image.height, options);
  try {
    gl.texImage2D(3553 /*gl.TEXTURE_2D*/, 0, texture.format, texture.format, texture.type, image);
  } 
  catch (e) 
  {
    console.log("no texture");
  }

  // no mipmaps
  //if (options.minFilter && options.minFilter != gl.NEAREST && options.minFilter != gl.LINEAR) {
  //  gl.generateMipmap(3553 /*gl.TEXTURE_2D*/);
  //}
  return texture;
};


// src/vector.js
// Provides a simple 3D vector class. Vector operations can be done using member
// functions, which return new vectors, or static functions, which reuse
// existing vectors to avoid generating garbage.
function Vector(x, y, z) {
  this.x = x || 0;
  this.y = y || 0;
  this.z = z || 0;
}

// ### Instance Methods
// The methods `add()`, `subtract()`, `multiply()`, and `divide()` can all
// take either a vector or a number as an argument.
Vector.prototype = 
{

  add: function(v) {
    if (v instanceof Vector) return new Vector(this.x + v.x, this.y + v.y, this.z + v.z);
    else return new Vector(this.x + v, this.y + v, this.z + v);
  },

  subtract: function(v) {
    if (v instanceof Vector) return new Vector(this.x - v.x, this.y - v.y, this.z - v.z);
    else return new Vector(this.x - v, this.y - v, this.z - v);
  }
};

    return GL;

})();

