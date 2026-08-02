/**
 * Register your submission and choose a character
 * For more information check out the documentation
 * http://anitype.com/documentation
 */
Anitype.register("W", {
  // Enter your name
  author: "Alex Sciuto",

  // Enter a personal website, must have http
  website: "http://www.alexsciuto.com/",

  // Make your animation here
  construct: function (two, points) {
    // Reference to instance
    var anitype = this;

    var duration = 1;

    var p0 = [points[0].x, points[0].y];
    var p1 = [points[1].x, points[1].y];
    var p2 = [points[2].x, points[2].y];
    var p3 = [points[3].x, points[3].y];
    var p4 = [points[4].x, points[4].y];

    // Two.js Copied Points

    var copyOne = points[1].clone();
    var copyTwo = points[2].clone();
    var copyThree = points[3].clone();

    // Create a Two.Polygon
    var left = anitype.makePolygon([points[0], points[1]]);
    var swing = anitype.makePolygon([copyOne, points[2]]);
    var left1 = anitype.makePolygon([copyTwo, points[3]]);
    var right = anitype.makePolygon([copyThree, points[4]]);

    var slopeLeft = 3;

    //First Line

    var offsetTop1 = -40;
    var offsetBottom1 = -240;
    points[0].x = points[0].x - offsetTop1;
    points[0].y = points[0].y - slopeLeft * offsetTop1;
    points[1].x = points[1].x - offsetBottom1;
    points[1].y = points[1].y - slopeLeft * offsetBottom1;

    anitype.addTween(points[0], {
      to: { x: p0[0], y: p0[1] },
      easing: Anitype.Easing.Linear.Out,
      duration: 0.5, // Value from 0 - 1
      start: 0, // Value from 0 - 1
    });

    anitype.addTween(points[1], {
      to: { x: p1[0], y: p1[1] },
      easing: Anitype.Easing.Linear.Out,
      duration: 0.5, // Value from 0 - 1
      start: 0, // Value from 0 - 1
    });

    //Swing Line

    copyOne.x = p3[0];
    copyOne.y = p3[1];
    points[2].x = p3[0];
    points[2].y = p3[1];

    anitype.addTween(points[2], {
      to: { x: p2[0], y: p2[1] },
      easing: Anitype.Easing.Bounce.Out,
      duration: 0.01, // Value from 0 - 1
      start: 0.5, // Value from 0 - 1
      complete: function () {
        anitype.addTween(points[3], {
          to: { x: p1[0], y: p1[1] },
          easing: Anitype.Easing.Bounce.Out,
          duration: 0.3, // Value from 0 - 1
          start: 0.53, // Value from 0 - 1
        });
      },
    });

    //Second Line

    var offsetTop2 = -90;
    var offsetBottom2 = -320;

    copyTwo.x = copyTwo.x - offsetTop2;
    copyTwo.y = copyTwo.y - slopeLeft * offsetTop2;
    points[3].x = points[3].x - offsetBottom2;
    points[3].y = points[3].y - slopeLeft * offsetBottom2;

    anitype.addTween(copyTwo, {
      to: { x: p2[0], y: p2[1] },
      easing: Anitype.Easing.Linear.Out,
      duration: 0.5, // Value from 0 - 1
      start: 0, // Value from 0 - 1
    });

    anitype.addTween(points[3], {
      to: { x: p3[0], y: p3[1] },
      easing: Anitype.Easing.Linear.Out,
      duration: 0.5, // Value from 0 - 1
      start: 0, // Value from 0 - 1
    });

    //Right Line
    var offsetTop3 = 360;
    var offsetBottom3 = 50;
    var rightSlope = 3.75;

    copyThree.x = copyThree.x + offsetTop3;
    copyThree.y = copyThree.y - rightSlope * offsetTop3;
    points[4].x = points[4].x - offsetBottom3;
    points[4].y = points[4].y + rightSlope * offsetBottom3;

    anitype.addTween(copyThree, {
      to: { x: p4[0], y: p4[1] },
      easing: Anitype.Easing.Linear.Out,
      duration: 0.6, // Value from 0 - 1
      start: 0.1, // Value from 0 - 1
    });

    anitype.addTween(points[4], {
      to: { x: p3[0], y: p3[1] },
      easing: Anitype.Easing.Linear.Out,
      duration: 0.5, // Value from 0 - 1
      start: 0.0, // Value from 0 - 1
    });

    // Return your polygon wrapped in a group.
    return two.makeGroup([left, swing, left1, right]);
  },
});

//-------------------------------

Anitype.register("*", {
  author: "John Mars",
  website: "http://M4R5.io",
  construct: function (two, points) {
    // reference to this instance
    var anitype = this;

    // the letter skeleton
    var polygon = anitype.makePolygon(points);

    // the vertices of the letter, subdivided
    var vertices = polygon.subdivide(3).vertices;

    // Two.js has an Underscore.js dependency, so we can use it here
    // make a random-sized "star" for each vertex, but place it randomly on the canvas
    var stars = _.map(vertices, function (vertex, i) {
      var star = two.makeCircle(0, 0, 10);
      star.translation.set(
        Math.random() * 1000 - 500,
        Math.random() * 1000 - 500,
      );
      star.scale = Math.random() * 4;
      return star;
    });

    // create a list of each vertex as a vector (for vector math later)
    var vertexVectors = _.map(vertices, function (vertex, i) {
      return new Two.Vector(vertices[i].x, vertices[i].y);
    });

    // pick a random sign (+/-) for each vertex (for vector math later)
    var directions = _.map(vertices, function (vertex, i) {
      return Math.random() < 0.5 ? -1 : 1;
    });

    // control individual star scaling
    _.each(stars, function (star, i) {
      anitype.addTween(star, {
        to: { scale: 1 },
        easing: Anitype.Easing.Exponential.In,
        duration: 0.66,
        start: 0,
      });
    });

    // control individual star movement
    anitype.addTick(function (percent) {
      _.each(stars, function (star, i) {
        // linear interpolation from current star position to goal vertex position, as a function of the current frame
        star.translation.lerp(vertexVectors[i], percent * 2);

        // vector rotations for orbital realism
        star.translation.addSelf(
          new Two.Vector(
            Math.cos(percent * Math.PI * 2) *
              (1.0 - percent) *
              5 *
              directions[i],
            Math.sin(percent * Math.PI * 2) *
              (1.0 - percent) *
              5 *
              directions[i],
          ),
        );
      });
    }, Anitype.Easing.Exponential.In);

    // Return stars wrapped in a group.
    return two.makeGroup(stars);
  },
});

//-------------------------------

/**
 * Register your submission and choose a character
 * For more information check out the documentation
 * http://anitype.com/documentation
 */
Anitype.register("Y", {
  // Enter your name
  author: "Yeliz Karadayi",

  // Enter a personal website, must have http
  website: "http://ygk-arch.com",

  // Make your animation here

  construct: function (two, points) {
    // Reference to instance
    var anitype = this;

    // Create a Two.Polygon
    var letterY = anitype.makePolygon(points);
    var animY = anitype.makePolygon();

    anitype.addTick(function (percent) {
      var v = letterY.vertices;
      var v2 = animY.vertices;

      var dy = v[0].y;
      var t2 = percent * 100;

      animY.vertices.push(
        new Two.Anchor(
          v[3].x + 30 - t2 / 3,
          v[3].y - 200 + t2 * 2,
          null,
          null,
          null,
          null,
          Two.Commands.move,
        ),
      );
      animY.vertices.push(
        new Two.Anchor(
          v[4].x,
          v[4].y,
          null,
          null,
          null,
          null,
          Two.Commands.curve,
        ),
      );
      animY.vertices.push(
        new Two.Anchor(
          v[3].x - 30 + t2 / 3,
          v[3].y - 200 + t2 * 2,
          null,
          null,
          null,
          null,
          Two.Commands.curve,
        ),
      );

      animY.vertices.push(
        new Two.Anchor(
          v[0].x,
          v[0].y,
          null,
          null,
          v[0].x,
          v[0].y + 200 - t2 * 2,
          Two.Commands.move,
        ),
      );
      animY.vertices.push(
        new Two.Anchor(
          v[1].x,
          v[1].y - 200 + t2 * 2,
          v[1].x - 50 + t2 / 2,
          v[1].y - 200 + t2 * 2,
          v[1].x + 50 - t2 / 2,
          v[1].y - 200 + t2 * 2,
          Two.Commands.curve,
        ),
      );
      animY.vertices.push(
        new Two.Anchor(
          v[2].x,
          v[2].y,
          v[2].x,
          v[2].y + 200 - t2 * 2,
          null,
          null,
          Two.Commands.curve,
        ),
      );

      if (t2 > 60) {
        for (i = 0; i < 24; i++) {
          if (animY.vertices.length > 6) {
            animY.vertices.shift();
          }
        }
      }
    });

    // Return your polygon wrapped in a group.
    return two.makeGroup(animY);
  },
});

/**
 * Register your submission and choose a character
 * For more information check out the documentation
 * http://anitype.com/documentation
 */
Anitype.register("Y", {
  // Enter your name
  author: "Yeliz Karadayi",

  // Enter a personal website, must have http
  website: "http://ygk-arch.com",

  // Make your animation here
  construct: function (two, points) {
    // Reference to instance
    var anitype = this;

    // Create a Two.Polygon
    var polygon = anitype.makePolygon(points);

    var a = points[4];
    var b = points[3];

    var c = points[0];
    var d = points[1];
    var e = points[2];

    b.dest = { x: b.x, y: b.y };
    b.y = c.y;
    anitype.addTween(b, {
      to: b.dest,
      easing: Anitype.Easing.Bounce.Out,
      duration: 0.7,
      start: 0.3,
    });

    a.dest = { x: a.x, y: a.y };
    a.copy(b);
    anitype.addTween(a, {
      to: a.dest,
      easing: Anitype.Easing.Bounce.Out,
      duration: 0.7,
      start: 0.3,
    });

    var ca = new Two.Anchor(
      c.x,
      c.y,
      null,
      null,
      c.x,
      c.y + 300,
      Two.Commands.move,
    );
    var da = new Two.Anchor(
      d.x,
      d.y,
      d.x - 50,
      d.y,
      d.x + 50,
      d.y,
      Two.Commands.curve,
    );
    var ea = new Two.Anchor(
      e.x,
      e.y,
      e.x,
      e.y + 300,
      null,
      null,
      Two.Commands.curve,
    );

    c.command = Two.Commands.move;
    d.command = Two.Commands.curve;
    e.command = Two.Commands.curve;

    v1 = new Two.Vector(c.x, c.y + 30);
    v2 = new Two.Vector(d.x - 50, c.y + 30);
    v3 = new Two.Vector(d.x + 50, c.y + 30);
    v4 = new Two.Vector(e.x, e.y + 30);

    // c.controls.right = ( v1 );
    // d.controls.left = ( v2 );
    // d.controls.right = ( v3 );
    // e.controls.left = ( v4 );

    cc = c.controls.right;
    cc.dest = { x: cc.x, y: cc.y };
    cc.copy(v1);
    anitype.addTween(cc, {
      to: cc.dest,
      easing: Anitype.Easing.Bounce.Out,
      duration: 0.5,
      start: 0.5,
    });

    var dd = d.controls.left;
    dd.dest = { x: dd.x, y: dd.y };
    dd.copy(v2);
    anitype.addTween(dd, {
      to: dd.dest,
      easing: Anitype.Easing.Bounce.Out,
      duration: 0.5,
      start: 0.5,
    });
    dd = d.controls.right;
    dd.dest = { x: dd.x, y: dd.y };
    dd.copy(v3);
    anitype.addTween(dd, {
      to: dd.dest,
      easing: Anitype.Easing.Bounce.Out,
      duration: 0.5,
      start: 0.5,
    });
    dd = d;
    dd.dest = { x: d.x, y: d.y };
    dd.y = c.y;
    anitype.addTween(dd, {
      to: dd.dest,
      easing: Anitype.Easing.Bounce.Out,
      duration: 0.7,
      start: 0.3,
    });
    var ee = e.controls.left;
    ee.dest = { x: ee.x, y: ee.y };
    ee.copy(v4);
    anitype.addTween(ee, {
      to: ee.dest,
      easing: Anitype.Easing.Bounce.Out,
      duration: 0.5,
      start: 0.5,
    });

    // Return your polygon wrapped in a group.
    return two.makeGroup(polygon);
  },
});

/**
 * Register your submission and choose a character
 * For more information check out the documentation
 * http://anitype.com/documentation
 */
Anitype.register("Y", {
  // Enter your name
  author: "Yeliz Karadayi",

  // Enter a personal website, must have http
  website: "http://ygk-arch.com",
  // Make your animation here
  construct: function (two, points) {
    // Reference to instance
    var anitype = this;

    // Create a Two.Polygon
    var polygon = anitype.makePolygon(points);
    var a = points[4];
    var b = points[3];
    b.y = b.y - 100;

    b.dest = { x: b.x, y: b.y + 100 };
    anitype.addTween(b, {
      to: b.dest,
      easing: Anitype.Easing.Bounce.Out,
      duration: 0.5,
      start: 0.5,
    });

    a.dest = { x: a.x, y: a.y };
    a.copy(b);
    anitype.addTween(a, {
      to: a.dest,
      easing: Anitype.Easing.Bounce.Out,
      duration: 0.5,
      start: 0.5,
    });

    var c = points[0];
    var d = points[1];
    var e = points[2];

    var ca = new Two.Anchor(
      c.x,
      c.y,
      null,
      null,
      c.x,
      c.y + 300,
      Two.Commands.move,
    );
    var da = new Two.Anchor(
      d.x,
      d.y,
      d.x - 50,
      d.y,
      d.x + 50,
      d.y,
      Two.Commands.curve,
    );
    var ea = new Two.Anchor(
      e.x,
      e.y,
      e.x,
      e.y + 300,
      null,
      null,
      Two.Commands.curve,
    );

    c.command = Two.Commands.move;
    d.command = Two.Commands.curve;
    e.command = Two.Commands.curve;

    v1 = new Two.Vector(c.x, c.y + 300);
    v2 = new Two.Vector(d.x - 50, d.y - 100);
    v3 = new Two.Vector(d.x + 50, d.y - 100);
    v4 = new Two.Vector(e.x, e.y + 300);

    d.y -= 100;
    // c.controls.right = ( v1 );
    // d.controls.left = ( v2 );
    // d.controls.right = ( v3 );
    // e.controls.left = ( v4 );

    cc = c.controls.right;
    cc.dest = { x: cc.x, y: cc.y };
    cc.copy(v1);
    anitype.addTween(cc, {
      to: cc.dest,
      easing: Anitype.Easing.Bounce.Out,
      duration: 0.5,
      start: 0.5,
    });

    var dd = d.controls.left;
    dd.dest = { x: dd.x, y: dd.y };
    dd.copy(v2);
    anitype.addTween(dd, {
      to: dd.dest,
      easing: Anitype.Easing.Bounce.Out,
      duration: 0.5,
      start: 0.5,
    });
    dd = d.controls.right;
    dd.dest = { x: dd.x, y: dd.y };
    dd.copy(v3);
    anitype.addTween(dd, {
      to: dd.dest,
      easing: Anitype.Easing.Bounce.Out,
      duration: 0.5,
      start: 0.5,
    });
    dd = d;
    dd.dest = { x: d.x, y: d.y + 100 };
    anitype.addTween(dd, {
      to: dd.dest,
      easing: Anitype.Easing.Bounce.Out,
      duration: 0.5,
      start: 0.5,
    });
    var ee = e.controls.left;
    ee.dest = { x: ee.x, y: ee.y };
    ee.copy(v4);
    anitype.addTween(ee, {
      to: ee.dest,
      easing: Anitype.Easing.Bounce.Out,
      duration: 0.5,
      start: 0.5,
    });

    // Return your polygon wrapped in a group.
    return two.makeGroup(polygon);
  },
});

/**
 * Register your submission and choose a character
 * For more information check out the documentation
 * http://anitype.com/documentation
 */
Anitype.register("Y", {
  // Enter your name
  author: "Yeliz Karadayi",

  // Enter a personal website, must have http
  website: "http://ygk-arch.com",

  // Make your animation here
  construct: function (two, points) {
    // Reference to instance
    var anitype = this;

    // Create a Two.Polygon
    var polygon = anitype.makePolygon(points);
    var a = points[4];
    var b = points[3];
    b.y = b.y - 300;

    b.dest = { x: b.x, y: b.y + 300 };
    anitype.addTween(b, {
      to: b.dest,
      easing: Anitype.Easing.Bounce.Out,
      duration: 0.7,
      start: 0.3,
    });

    a.dest = { x: a.x, y: a.y };
    a.copy(b);
    anitype.addTween(a, {
      to: a.dest,
      easing: Anitype.Easing.Bounce.Out,
      duration: 0.7,
      start: 0.3,
    });

    var c = points[0];
    var d = points[1];
    var e = points[2];

    var ca = new Two.Anchor(
      c.x,
      c.y,
      null,
      null,
      c.x,
      c.y + 300,
      Two.Commands.move,
    );
    var da = new Two.Anchor(
      d.x,
      d.y,
      d.x - 50,
      d.y,
      d.x + 50,
      d.y,
      Two.Commands.curve,
    );
    var ea = new Two.Anchor(
      e.x,
      e.y,
      e.x,
      e.y + 300,
      null,
      null,
      Two.Commands.curve,
    );

    c.command = Two.Commands.move;
    d.command = Two.Commands.curve;
    e.command = Two.Commands.curve;

    v1 = new Two.Vector(c.x, c.y + 300);
    v2 = new Two.Vector(d.x - 50, d.y - 100);
    v3 = new Two.Vector(d.x + 50, d.y - 100);
    v4 = new Two.Vector(e.x, e.y + 300);

    d.y -= 100;
    // c.controls.right = ( v1 );
    // d.controls.left = ( v2 );
    // d.controls.right = ( v3 );
    // e.controls.left = ( v4 );

    cc = c.controls.right;
    cc.dest = { x: cc.x, y: cc.y };
    cc.copy(v1);
    anitype.addTween(cc, {
      to: cc.dest,
      easing: Anitype.Easing.Bounce.Out,
      duration: 0.5,
      start: 0.5,
    });
    //jon

    http: var dd = d.controls.left;
    dd.dest = { x: dd.x, y: dd.y };
    dd.copy(v2);
    anitype.addTween(dd, {
      to: dd.dest,
      easing: Anitype.Easing.Bounce.Out,
      duration: 0.5,
      start: 0.5,
    });
    dd = d.controls.right;
    dd.dest = { x: dd.x, y: dd.y };
    dd.copy(v3);
    anitype.addTween(dd, {
      to: dd.dest,
      easing: Anitype.Easing.Bounce.Out,
      duration: 0.5,
      start: 0.5,
    });
    dd = d;
    dd.dest = { x: d.x, y: d.y + 100 };
    anitype.addTween(dd, {
      to: dd.dest,
      easing: Anitype.Easing.Bounce.Out,
      duration: 0.5,
      start: 0.5,
    });
    var ee = e.controls.left;
    ee.dest = { x: ee.x, y: ee.y };
    ee.copy(v4);
    anitype.addTween(ee, {
      to: ee.dest,
      easing: Anitype.Easing.Bounce.Out,
      duration: 0.5,
      start: 0.5,
    });

    // Return your polygon wrapped in a group.
    return two.makeGroup(polygon);
  },
});

//-------------------------------

Anitype.register("Z", {
  // Enter your name
  author: "sejal",

  // Enter a personal website, must have http
  website: "http://www.sejalpopat.com/",

  // Make your animation here
  construct: function (two, points) {
    // Reference to instance
    var anitype = this;

    // Create a Two.Polygon
    var polygon = anitype.makePolygon(points);
    // Set an initial state
    polygon.scale = 1;

    //name points
    var tl = polygon.vertices[0]; //top left
    var tr = polygon.vertices[1]; //top right
    var bl = polygon.vertices[2]; //bottom left
    var br = polygon.vertices[3]; //bottom right

    //swing the top and bottom bars into middle diagonal
    anitype.addTween(tl, {
      to: { x: 0, y: 0 },
      easing: Anitype.Easing.Sinusoidal.Out,
      duration: 0.5,
      start: 0,
    });

    anitype.addTween(br, {
      to: { x: 0, y: 0 },
      easing: Anitype.Easing.Sinusoidal.Out,
      duration: 0.5,
      start: 0,
    });

    anitype.addTween(tr, {
      to: { x: 0 },
      duration: 0.5,
      start: 0,
    });

    anitype.addTween(bl, {
      to: { x: 0 },
      duration: 0.5,
      start: 0,
    });

    //rotate whole polygon
    anitype.addTween(polygon, {
      to: { rotation: -3, scale: 1 },
      easing: Anitype.Easing.Quadratic.Out,
      duration: 1,
      start: 0.4,
    });

    // Return your polygon wrapped in a group.
    return two.makeGroup(polygon);
  },
});

//-------------------------------

Anitype.register("R", {
  // Enter your name
  author: "Dan Russo",

  // Enter a personal website, must have http
  website: "http://solidhaptik.io",

  construct: function (two, points) {
    // Points for anitype letter "R" and "O" are obtained
    var anitype = this;
    var anchorsOrbit = [];
    var oh = Anitype.getEndpoints("o", 1000);
    // Letter "o" is used to quickly generate vertices for a circular path
    var i = 0;
    _.each(oh, function (p) {
      if (i > 0 && i < 5)
        anchorsOrbit.push(
          new Two.Anchor(
            p.x,
            p.y,
            p.controls.left.x,
            p.controls.left.y,
            p.controls.right.x,
            p.controls.right.y,
            Two.Commands.curve,
          ),
        );
      else if (i >= 5)
        anchorsOrbit.push(
          new Two.Anchor(
            p.x,
            p.y,
            p.controls.left.x,
            p.controls.left.y,
            p.controls.right.x,
            p.controls.right.y,
            Two.Commands.line,
          ),
        );
      else
        anchorsOrbit.push(
          new Two.Anchor(
            p.x,
            p.y,
            p.controls.left.x,
            p.controls.left.y,
            p.controls.right.x,
            p.controls.right.y,
            Two.Commands.move,
          ),
        );
      i++;
    });

    // Create polygons for visible letter and orbit path
    var polygon = anitype.makePolygon(points);
    polygon.scale = 0;
    var orbit = anitype.makePolygon(anchorsOrbit).subdivide();

    // Creates the animation of letter "R" via a tween
    anitype.addTween(polygon, {
      to: { scale: 1 },
      easing: Anitype.Easing.Elastic.Out,
      duration: 0.2,
      start: 0,
    });

    // Make Electrons via Circle
    var electron1 = two.makeCircle(0, 0, 8);
    var electron2 = two.makeCircle(0, 0, 8);
    var electron3 = two.makeCircle(0, 0, 8);

    // Animation for 1st orbit
    anitype.addTick(function (percent) {
      var idx =
        Math.floor(percent * orbit.vertices.length) % orbit.vertices.length;
      electron1.translation.y =
        (orbit.vertices[idx].y * Math.cos(45) +
          orbit.vertices[idx].x * Math.sin(45)) *
        1.5;
      electron1.translation.x =
        (orbit.vertices[idx].x * Math.cos(45) -
          orbit.vertices[idx].y * Math.sin(45)) *
        1.5;

      // Hide electrons behind letter

      if (percent < 0.2 || percent > 0) {
        electron1.scale = 1;
      } else {
        electron1.scale = 0;
      }
    });

    // Animation for 2nd orbit
    anitype.addTick(function (percent) {
      var idx =
        Math.floor(percent * orbit.vertices.length) % orbit.vertices.length;
      electron2.translation.y =
        (orbit.vertices[idx].x * Math.cos(180) +
          orbit.vertices[idx].y * Math.sin(180)) *
        2;
      electron2.translation.x =
        (orbit.vertices[idx].y * Math.cos(180) -
          orbit.vertices[idx].x * Math.sin(180)) *
        2;

      if (percent < 0.2 || percent > 0) {
        electron2.scale = 1;
      } else {
        electron2.scale = 0;
      }
    });

    // Animation for 3rd orbit
    anitype.addTick(function (percent) {
      var idx =
        Math.floor(percent * orbit.vertices.length) % orbit.vertices.length;
      electron3.translation.y =
        (orbit.vertices[idx].x + orbit.vertices[idx].y) * 1.25;
      electron3.translation.x =
        (orbit.vertices[idx].y - orbit.vertices[idx].x) * 1.25;

      if (percent < 0.2 || percent > 0) {
        electron3.scale = 1;
      } else {
        electron3.scale = 0;
      }
    });

    // Returned polygon in wrapped group.
    return two.makeGroup([polygon, electron1, electron2, electron3]);
  },
});

//-------------------------------

/**
 * Register your submission and choose a character
 * For more information check out the documentation
 * http://anitype.com/documentation
 */
Anitype.register("M", {
  // Enter your name
  author: "Bryce Summers",

  // Enter a personal website, must have http
  website: "http://www.brycesummers.com/",

  // Make your animation here
  construct: function (two, points) {
    // Reference to instance
    var anitype = this;

    this.duration = 1000;

    // Create a Two.Polygon
    var polygon = anitype.makePolygon(points);
    // Set an initial state
    var x0 = polygon.vertices[0].x;
    var y0 = polygon.vertices[0].y;

    var x1 = polygon.vertices[1].x;
    var y1 = polygon.vertices[1].y;

    var x2 = polygon.vertices[2].x;
    var y2 = polygon.vertices[2].y;

    var x3 = polygon.vertices[3].x;
    var y3 = polygon.vertices[3].y;

    var x4 = polygon.vertices[4].x;
    var y4 = polygon.vertices[4].y;

    var v0 = polygon.vertices[0];
    var v1 = polygon.vertices[1];
    var v2 = polygon.vertices[2];
    var v3 = polygon.vertices[3];
    var v4 = polygon.vertices[4];

    var val_h = 200;
    var val_v = 200;

    var easing = Anitype.Easing.Sinusoidal.In;
    var easing2 = Anitype.Easing.Sinusoidal.Out;

    /*
    polygon.vertices[0].set(x0 - val_h, y0 - val_h);
    polygon.vertices[1].set(x1 - val_h/2, y1 + val_h);
    polygon.vertices[2].set(x2, y2);
    polygon.vertices[3].set(x3 + val_h/2, y3 + val_h);
    polygon.vertices[4].set(x4 + val_h, y4 - val_h);
      */

    // There and back again.

    anitype.addTween(v0, {
      to: { x: x0 - val_h, y: y0 - val_h * 4 },
      easing: easing,
      duration: 0.5,
      start: 0,

      complete: function () {
        anitype.addTween(v0, {
          to: { x: x0, y: y0 },
          easing: easing2,
          duration: 0.5, // Value from 0 - 1
          start: 0.5, // Value from 0 - 1
        });
      },
    });

    anitype.addTween(v1, {
      to: { x: x1 + val_h / 2, y: y1 + val_h * 2 },
      easing: easing,
      duration: 0.5,
      start: 0,

      complete: function () {
        anitype.addTween(v1, {
          to: { x: x1, y: y1 },
          easing: easing2,
          duration: 0.5, // Value from 0 - 1
          start: 0.5, // Value from 0 - 1
        });
      },
    });

    anitype.addTween(v2, {
      to: { x: x2, y: y2 + val_v * 0.7 },
      easing: easing,
      duration: 0.5,
      start: 0,

      complete: function () {
        anitype.addTween(v2, {
          to: { x: x2, y: y2 },
          easing: easing2,
          duration: 0.5, // Value from 0 - 1
          start: 0.5, // Value from 0 - 1
        });
      },
    });

    anitype.addTween(v3, {
      to: { x: x3 - val_h / 2, y: y3 + val_h * 2 },
      easing: easing,
      duration: 0.5,
      start: 0,

      complete: function () {
        anitype.addTween(v3, {
          to: { x: x3, y: y3 },
          easing: easing2,
          duration: 0.5, // Value from 0 - 1
          start: 0.5, // Value from 0 - 1
        });
      },
    });

    anitype.addTween(polygon.vertices[4], {
      to: { x: x4 + val_h, y: y4 - val_h * 4 },
      easing: easing,
      duration: 0.5,
      start: 0,

      complete: function () {
        anitype.addTween(v4, {
          to: { x: x4, y: y4 },
          easing: easing2,
          duration: 0.5, // Value from 0 - 1
          start: 0.5, // Value from 0 - 1
        });
      },
    });

    // Return your polygon wrapped in a group.
    return two.makeGroup(polygon);
  },
});

//-------------------------------

Anitype.register("M", {
  author: "Miles Hiroo",
  website: "http://mileshiroo.info/",
  construct: function (two, points) {
    var anitype = this;
    var polygon = anitype.makePolygon(points);
    var sign = Math.random() < 0.5 ? -1 : 1;
    polygon.scale = 0.7;

    var w = Anitype.Dimensions.width;
    var h = Anitype.Dimensions.height;

    var left_leg = polygon.vertices[0];
    var right_leg = polygon.vertices[points.length - 1];
    var middle = polygon.vertices[2];
    var left_knee = polygon.vertices[1];
    var right_knee = polygon.vertices[3];

    anitype.addTween(left_knee, {
      from: { x: middle.x, y: middle.y + h * 0.2 },
      to: { x: left_knee.x, y: left_knee.y },
      easing: Anitype.Easing.Elastic.Out,
      duration: 2,
      start: 0.4,
    });

    anitype.addTween(right_knee, {
      from: { x: middle.x, y: middle.y + h * 0.2 },
      to: { x: right_knee.x, y: right_knee.y },
      easing: Anitype.Easing.Elastic.Out,
      duration: 2,
      start: 0.4,
    });

    anitype.addTween(left_leg, {
      from: { y: left_leg.y - w * 0.2 },
      to: { y: left_leg.y },
      easing: Anitype.Easing.Linear.None,
      duration: 0.2,
      start: 0,
    });

    anitype.addTween(right_leg, {
      from: { y: right_leg.y - w * 0.2 },
      to: { y: right_leg.y },
      easing: Anitype.Easing.Linear.None,
      duration: 0.2,
      start: 0,
    });

    anitype.addTween(middle, {
      from: { y: h * 0.8 },
      to: { y: middle.y },
      easing: Anitype.Easing.Elastic.Out,
      duration: 2,
      start: 0.2,
    });

    var xSign = Math.random() < 0.5 ? -1 : 1;

    anitype.addTween(middle, {
      from: { x: middle.x + Math.random() * w * 0.3 * xSign },
      to: { x: middle.x },
      easing: Anitype.Easing.Elastic.Out,
      duration: 1,
      start: 0,
    });

    anitype.addTween(polygon, {
      to: { rotation: 0, scale: 1 },
      easing: Anitype.Easing.Elastic.Out,
      duration: 1,
      start: 0,
    });

    return two.makeGroup(polygon);
  },
});

//-------------------------------

/**
 * Register your submission and choose a character
 * For more information check out the documentation
 * http://anitype.com/documentation
 */
Anitype.register("*", {
  // Enter your name
  author: "pedro",

  // Enter a personal website, must have http
  website: "https://www.facebook.com/pedro.luis.104",

  // Make your animation here
  construct: function (two, points) {
    // Reference to instance
    var anitype = this;

    // Create a Two.Polygon
    var polygon = anitype.makePolygon(points);

    // Set an initial state
    var final0 = { x: polygon.vertices[0].x, y: polygon.vertices[0].y };
    var final2 = { x: polygon.vertices[2].x, y: polygon.vertices[2].y };
    var final4 = { x: polygon.vertices[4].x, y: polygon.vertices[4].y };
    var final5 = { x: polygon.vertices[5].x, y: polygon.vertices[5].y };
    var final7 = { x: polygon.vertices[7].x, y: polygon.vertices[7].y };
    var launch0 = {
      x: Math.random() * 1600 - 800,
      y: Math.random() * 1600 - 800,
    };
    var launch2 = {
      x: Math.random() * 1600 - 800,
      y: Math.random() * 1600 - 800,
    };
    var launch4 = {
      x: Math.random() * 1600 - 800,
      y: Math.random() * 1600 - 800,
    };
    var launch5 = {
      x: Math.random() * 1600 - 800,
      y: Math.random() * 1600 - 800,
    };
    var launch7 = {
      x: Math.random() * 1600 - 800,
      y: Math.random() * 1600 - 800,
    };
    var time0 = 0.2 - Math.random() * 0.15;
    var time2 = 0.2 - Math.random() * 0.15;
    var time4 = 0.2 - Math.random() * 0.15;
    var time5 = 0.2 - Math.random() * 0.15;
    var time7 = 0.2 - Math.random() * 0.15;

    // Set an initial state
    polygon.vertices[0].set(0, 0);
    polygon.vertices[1].set(0, 0);
    polygon.vertices[2].set(0, 0);
    polygon.vertices[3].set(0, 0);
    polygon.vertices[4].set(0, 0);
    polygon.vertices[5].set(0, 0);
    polygon.vertices[6].set(0, 0);
    polygon.vertices[7].set(0, 0);

    anitype.addTween(polygon.vertices[0], {
      to: { x: launch0.x, y: launch0.y },
      easing: Anitype.Easing.Bounce.Out,
      duration: time0, // Value from 0 - 1
      start: 0, // Value from 0 - 1
      complete: function () {
        anitype.addTween(polygon.vertices[0], {
          to: { x: final0.x, y: final0.y },
          easing: Anitype.Easing.Bounce.Out,
          duration: 1 - time0, // Value from 0 - 1
          start: time0,
        });
      },
    });
    anitype.addTween(polygon.vertices[2], {
      to: { x: launch2.x, y: launch2.y },
      easing: Anitype.Easing.Bounce.Out,
      duration: time2, // Value from 0 - 1
      start: 0, // Value from 0 - 1
      complete: function () {
        anitype.addTween(polygon.vertices[2], {
          to: { x: final2.x, y: final2.y },
          easing: Anitype.Easing.Bounce.Out,
          duration: 1 - time2, // Value from 0 - 1
          start: time2,
        });
      },
    });
    anitype.addTween(polygon.vertices[4], {
      to: { x: launch4.x, y: launch4.y },
      easing: Anitype.Easing.Bounce.Out,
      duration: time4, // Value from 0 - 1
      start: 0, // Value from 0 - 1
      complete: function () {
        anitype.addTween(polygon.vertices[4], {
          to: { x: final4.x, y: final4.y },
          easing: Anitype.Easing.Bounce.Out,
          duration: 1 - time4, // Value from 0 - 1
          start: time4,
        });
      },
    });
    anitype.addTween(polygon.vertices[5], {
      to: { x: launch5.x, y: launch5.y },
      easing: Anitype.Easing.Bounce.Out,
      duration: time5, // Value from 0 - 1
      start: 0, // Value from 0 - 1
      complete: function () {
        anitype.addTween(polygon.vertices[5], {
          to: { x: final5.x, y: final5.y },
          easing: Anitype.Easing.Bounce.Out,
          duration: 1 - time5, // Value from 0 - 1
          start: time5,
        });
      },
    });
    anitype.addTween(polygon.vertices[7], {
      to: { x: launch7.x, y: launch7.y },
      easing: Anitype.Easing.Bounce.Out,
      duration: time7, // Value from 0 - 1
      start: 0, // Value from 0 - 1
      complete: function () {
        anitype.addTween(polygon.vertices[7], {
          to: { x: final7.x, y: final7.y },
          easing: Anitype.Easing.Bounce.Out,
          duration: 1 - time7, // Value from 0 - 1
          start: time7,
        });
      },
    });
    // Return your polygon wrapped in a group.
    return two.makeGroup(polygon);
  },
});

//-------------------------------

/**
 * Register your submission and choose a character
 * For more information check out the documentation
 * http://anitype.com/documentation
 */
Anitype.register("*", {
  // Enter your name
  author: "Epic Jefferson",

  // Enter a kickback website, must have http
  website: "http://www.epicjefferson.com/",

  // Make your animation here
  construct: function (two, points) {
    // Reference to instance
    var anitype = this;

    var polygon = anitype.makePolygon(points).subdivide();
    var dimensions = polygon.getBoundingClientRect();
    var angleStep = (Math.PI * 2) / polygon.vertices.length;

    _.each(polygon.vertices, function (vert, i) {
      var time = { value: 0 };
      vert.oX = vert.x;
      vert.oAngle = Math.sin(vert.x / dimensions.width / 2 + i * angleStep);
      anitype.addTween(time, {
        to: { value: 1 },
        easing: Anitype.Easing.Linear.None,
        duration: 1,
        start: 0,
        update: function () {
          var angle = vert.oAngle + this.value * Math.PI * 2;
          vert.x = Math.cos(angle) * vert.oX;
        },
      });
    });

    return two.makeGroup(polygon);
  },
});

//-------------------------------

/**
 * Register your submission and choose a character
 * For more information check out the documentation
 * http://anitype.com/documentation
 */
Anitype.register("W", {
  // Enter your name
  author: "Rachel",

  // Enter a personal website, must have http
  website: "http://www.rachelciavarella.com",

  //code adapted from Bryce Summers 'M' anitype submission

  // Make your animation here
  construct: function (two, points) {
    // Reference to instance
    var anitype = this;

    this.duration = 1000;

    // Create a Two.Polygon
    var polygon = anitype.makePolygon(points);
    // Set an initial state
    var x0 = polygon.vertices[0].x;
    var y0 = polygon.vertices[0].y;

    var x1 = polygon.vertices[1].x;
    var y1 = polygon.vertices[1].y;

    var x2 = polygon.vertices[2].x;
    var y2 = polygon.vertices[2].y;

    var x3 = polygon.vertices[3].x;
    var y3 = polygon.vertices[3].y;

    var x4 = polygon.vertices[4].x;
    var y4 = polygon.vertices[4].y;

    var v0 = polygon.vertices[0];
    var v1 = polygon.vertices[1];
    var v2 = polygon.vertices[2];
    var v3 = polygon.vertices[3];
    var v4 = polygon.vertices[4];

    //set easing
    var easing = Anitype.Easing.Elastic.Out;

    //first point
    anitype.addTween(v0, {
      to: { x: x0, y: y0 },
      duration: 1,
      start: 0,

      complete: function () {
        anitype.addTween(v0, {
          to: { x: x0, y: y0 },
          duration: 0.5, // Value from 0 - 1
          start: 0.5, // Value from 0 - 1
        });
      },
    });
    //second point
    anitype.addTween(v1, {
      to: { x: x1, y: y0 },
      easing: easing,
      duration: 0.5,
      start: 0,

      complete: function () {
        anitype.addTween(v1, {
          to: { x: x1, y: y1 + 400 },
          easing: easing,
          duration: 1, // Value from 0 - 1
          start: 0.5, // Value from 0 - 1
        });
      },
    });
    //third point
    anitype.addTween(v2, {
      to: { x: x2, y: y0 },
      easing: easing,
      duration: 0.5,
      start: 0,

      complete: function () {
        anitype.addTween(v2, {
          to: { x: x2, y: y2 },
          easing: easing,
          duration: 1, // Value from 0 - 1
          start: 0.5, // Value from 0 - 1
        });
      },
    });
    //fourth point
    anitype.addTween(v3, {
      to: { x: x3, y: y0 },
      easing: easing,
      duration: 0.5,
      start: 0,

      complete: function () {
        anitype.addTween(v3, {
          to: { x: x3, y: y3 + 400 },
          easing: easing,
          duration: 1, // Value from 0 - 1
          start: 0.5, // Value from 0 - 1
        });
      },
    });
    //fifth point
    anitype.addTween(polygon.vertices[4], {
      to: { x: x4, y: y4 },
      duration: 0.5,
      start: 0,

      complete: function () {
        anitype.addTween(v4, {
          to: { x: x4, y: y4 },
          easing: easing,
          duration: 0.5, // Value from 0 - 1
          start: 0.5, // Value from 0 - 1
        });
      },
    });

    // Return your polygon wrapped in a group.
    return two.makeGroup(polygon);
  },
});

//-------------------------------

/**
 * Register your submission and choose a character
 * For more information check out the documentation
 * http://anitype.com/documentation
 */
Anitype.register("Y", {
  // Enter your name
  author: "maria montenegro",

  // Enter a personal website, must have http
  website: "http://www.Fusion-Sky.com/",

  // Make your animation here
  construct: function (two, points) {
    // Reference to instance
    var anitype = this;

    //Create my main lines
    var line_1 = two.makeLine(0, 245, 0, -50);

    //var line_2 = two.makeLine(0,115,0,-258);
    //var line_3 = two.makeLine(0,115,0,-258);

    //Create Vertices foreach line
    line_1.vertices[0].set(0, -445); //245
    line_1.vertices[1].set(0, -650); //-50

    //line_2.vertices[0].set(0,255);
    //line_2.vertices[1].set(0,-258);

    //line_3.vertices[0].set(0,255);
    //line_3.vertices[1].set(0,-258);

    // mini lines
    var line_2_1 = two.makeLine(0, 115, 0, -50);
    var line_2_2 = two.makeLine(0, 115, 0, -50);
    var line_2_3 = two.makeLine(0, 115, 0, -50);

    line_2_1.vertices[0].set(0, 0);
    line_2_1.vertices[1].set(0, 0);

    line_2_2.vertices[0].set(0, -250);
    line_2_2.vertices[1].set(0, -250);

    line_2_3.vertices[0].set(0, -250);
    line_2_3.vertices[1].set(0, -250);

    var line_3_1 = two.makeLine(0, 115, 0, -50);
    var line_3_2 = two.makeLine(0, 115, 0, -50);
    var line_3_3 = two.makeLine(0, 115, 0, -50);

    line_3_1.vertices[0].set(0, 0);
    line_3_1.vertices[1].set(0, -150);

    line_3_2.vertices[0].set(0, -150);
    line_3_2.vertices[1].set(0, -250);

    line_3_3.vertices[0].set(0, -250);
    line_3_3.vertices[1].set(0, -250);

    //Create the animation via a tween
    function moveVert(vert, x1, x2, y1, y2, start, duration) {
      anitype.addTween(vert, {
        to: { x: x1, y: y1 },
        easing: Anitype.Easing.Circular.Out,
        update: function () {
          anitype.addTween(vert, {
            to: { x: x2, y: y2 },
            easing: Anitype.Easing.Elastic.Out,
            duration: duration,
            start: start,
          });
        },
        duration: duration, // Value from 0 - 1
        start: start, // Value from 0 - 1
      });
    }

    moveVert(line_1.vertices[0], 0, 0, -45, 245, 0, 1);
    moveVert(line_1.vertices[1], 0, 0, 245, -50, 0, 1);

    //moveVert(line_2.vertices[0],0,0,255,115,.25,.5);
    //moveVert(line_2.vertices[1],0,-215,115,-258,.25,.5);
    //moveVert(line_3.vertices[0],0,0,255,115,.25,.5);
    //moveVert(line_3.vertices[1],0,215,115,-258,.25,.5);

    moveVert(line_2_1.vertices[1], 0, -110, 115, -187, 0.15, 0.3);
    moveVert(line_2_2.vertices[0], 0, -110, 0, -187, 0, 1);
    moveVert(line_2_2.vertices[1], -110, -154, -187, -264, 0.25, 0.5);
    moveVert(line_2_3.vertices[0], 0, -154, 0, -264, 0.5, 1);
    moveVert(line_2_3.vertices[1], -154, -213, -264, -365, 0.7, 1);

    moveVert(line_3_1.vertices[1], 0, 110, 115, -187, 0.15, 0.3);
    moveVert(line_3_2.vertices[0], 0, 110, 0, -187, 0, 1);
    moveVert(line_3_2.vertices[1], 110, 154, -187, -264, 0.25, 0.5);
    moveVert(line_3_3.vertices[0], 0, 154, 0, -264, 0.5, 1);
    moveVert(line_3_3.vertices[1], 154, 213, -264, -365, 0.7, 1);

    return two.makeGroup(
      line_1,
      line_2_1,
      line_2_2,
      line_2_3,
      line_3_1,
      line_3_2,
      line_3_3,
    );
  },
});

//-------------------------------

/**
 * Register your submission and choose a character
 * For more information check out the documentation
 * http://anitype.com/documentation
 */

Anitype.register("C", {
  // Enter your name
  author: "Jack",

  // Enter a personal website, must have http
  website: "http://jackkoo.com",

  // Make your animation here
  construct: function (two, points) {
    // Reference to instance
    var anitype = this;

    // Create a Two.Polygon
    var polygon = anitype.makePolygon(points);

    // Save original positions
    var originalPoints = [];

    for (var i = 0; i < points.length; i++) {
      originalPoints.push(new Two.Vector(points[i].x, points[i].y));
    }

    // Pick either first point to second or vice versa
    var b = false;

    if (Math.random() > 0.5) {
      b = true;
    }

    // Pick a random point to connect to
    var start = Math.floor(Math.random() * points.length);

    for (var i = 0; i < points.length; i++) {
      if (b === true) {
        points[i].x = points[start].x;
        points[i].y = points[start].y;
      }
      b = !b;
    }

    polygon.rotation = -10;

    anitype.addTween(polygon, {
      to: { rotation: 0 },
      easing: Anitype.Easing.Elastic.Out,
      duration: 0.3, // Value from 0 - 1
      start: 0, // Value from 0 - 1
      complete: function () {
        for (var i = 0; i < points.length; i++) {
          anitype.addTween(polygon.vertices[i], {
            to: { x: originalPoints[i].x, y: originalPoints[i].y },
            easing: Anitype.Easing.Elastic.Out,
            duration: 1, // Value from 0 - 1
            start: 0.3, // Value from 0 - 1
          });
        }
      },
    });

    // Return your polygon wrapped in a group.
    return two.makeGroup(polygon);
  },
});

//-------------------------------

/**
 * Register your submission and choose a character
 * For more information check out the documentation
 * http://anitype.com/documentation
 */
Anitype.register("Z", {
  // Enter your name
  author: "Zack Aman",

  // Enter a personal website, must have http
  website: "http://www.zacharyaman.com",

  // Make your animation here
  construct: function (two, points) {
    // Reference to instance
    var anitype = this;

    // Create a Two.Polygon
    var polygon = anitype.makePolygon(points);

    //set all points to upper left part of the Z
    polygon.vertices[0].x = -179;
    polygon.vertices[0].y = -337;
    polygon.vertices[1].x = -179;
    polygon.vertices[1].y = -337;
    polygon.vertices[2].x = -179;
    polygon.vertices[2].y = -337;
    polygon.vertices[3].x = -179;
    polygon.vertices[3].y = -337;

    anitype.duration = 1400;
    var i = 0;
    anitype.addTick(function () {
      // console.log(i);
      i += 0.01;
      //move vertices 2 and 3 to (179,337)
      if (i < 0.31) {
        points[2].x = -179 + (2 * 179 * i * 10) / 3;
        points[2].y = -337 + (2 * 337 * i * 10) / 3;
        points[3].x = -179 + (2 * 179 * i * 10) / 3;
        points[3].y = -337 + (2 * 337 * i * 10) / 3;
      } else if (i >= 0.31 && i <= 0.62) {
        // console.log(points);
        points[1].x = -179 + (2 * 179 * (i - 0.31) * 10) / 3;
        points[2].x = 179 - (2 * 179 * (i - 0.31) * 10) / 3;
      } else if (i > 0.6) {
        //do nothing
      }
    }, Anitype.Easing.Circular.InOut);

    // Return your polygon wrapped in a group.
    return two.makeGroup(polygon);
  },
});

//-------------------------------

/**
 * Register your submission and choose a character
 * For more information check out the documentation
 * http://anitype.com/documentation
 */
Anitype.register("L", {
  // Enter your name
  author: "Thomas Langerak",

  // Enter a personal website, must have http
  website: "http://thomaslangerak.nl/",

  // Make your animation here
  construct: function (two, points) {
    // Reference to instance
    var anitype = this; //create an object?

    // Create a Two.Polygon
    var polygon = anitype.makePolygon(points); //make polygon
    var pv = polygon.vertices; //create a vertice for both lines
    _.each(pv, function (vert) {
      vert.oX = vert.x; //create x value
      vert.oY = vert.y; //create y value
    });

    // Set an initial state
    var scale = 1; //????

    // Create the animation via a tween
    anitype.addTween(polygon, {
      to: { value: scale }, //no clue yet
      easing: Anitype.Easing.Bounce.InOut, //easing (Linear, Circular, Elastic.... In, Out, InOut (graph form))
      duration: 0, // Value from 0 - 1 how lang the animation takes
      start: 0, // Value from 0 - 1 when the animation starts
      update: function () {
        //update the fertices
        pv[2].x = (pv[0].oX - pv[2].oX) * this.value + pv[2].oX; //ver
        pv[2].y = (pv[0].oY - pv[2].oY) * this.value + pv[2].oY;
      },
    });

    anitype.addTween(polygon, {
      to: { value: scale },
      easing: Anitype.Easing.Bounce.Out,
      duration: 0.9, // Value from 0 - 1
      start: 0, // Value from 0 - 1
      update: function () {
        pv[0].x = (pv[2].oX - pv[0].oX) * this.value + pv[0].oX;
        pv[0].y = (pv[2].oY - pv[0].oY) * this.value + pv[0].oY;
      },
    });

    // Return your polygon wrapped in a group.
    return two.makeGroup(polygon);
  },
});

/**
 * Register your submission and choose a character
 * For more information check out the documentation
 * http://anitype.com/documentation
 */
Anitype.register("L", {
  // Enter your name
  author: "Thomas Langerak",

  // Enter a personal website, must have http
  website: "http://thomaslangerak.nl/",

  // Make your animation here
  construct: function (two, points) {
    // Reference to instance
    var anitype = this; //create an object?

    // Create a Two.Polygon
    var polygon = anitype.makePolygon(points); //make polygon
    var pv = polygon.vertices; //create a vertice for both lines
    _.each(pv, function (vert) {
      vert.oX = vert.x; //create x value
      vert.oY = vert.y; //create y value
    });

    // Set an initial state
    var scale = 1; //????

    // Create the animation via a tween
    anitype.addTween(polygon, {
      to: { value: scale }, //no clue yet
      easing: Anitype.Easing.Linear.Out, //easing (Linear, Circular, Elastic.... In, Out, InOut (graph form))
      duration: 1, // Value from 0 - 1 how lang the animation takes
      start: 0, // Value from 0 - 1 when the animation starts
      update: function () {
        //update the vertices
        pv[2].x = (pv[0].oX - pv[2].oX) * this.value + pv[2].oX; //ver????
        pv[2].y = (pv[0].oY - pv[2].oY) * this.value + pv[2].oY;
      },
    });

    anitype.addTween(polygon, {
      to: { value: scale },
      easing: Anitype.Easing.Bounce.Out,
      duration: 0.8, // Value from 0 - 1
      start: 0.1, // Value from 0 - 1
      update: function () {
        pv[0].x = (pv[2].oX - pv[0].oX) * this.value + pv[0].oX; //hor????
        pv[0].y = (pv[2].oY - pv[0].oY) * this.value + pv[0].oY;
      },
    });

    // Return your polygon wrapped in a group.
    return two.makeGroup(polygon);
  },
});

//-------------------------------

Anitype.register("S", {
  author: "sam ticknor",
  website: "http://samanthaticknor.com/",

  construct: function (two, points) {
    // Reference to instance
    var anitype = this;

    // Create a Two.Polygon
    var polygon = anitype.makePolygon(points);

    // Adding and adjusting vertices
    polygon.vertices[0].y = -190;
    polygon.vertices[0].command = Two.Commands.curve;
    polygon.vertices[0].controls.left.y = -170;
    polygon.vertices[0].controls.right.y = -240;
    polygon.vertices[1].controls.left.x = 170;
    polygon.vertices[3].x = 0;
    polygon.vertices[3].y = 0;
    polygon.vertices[3].controls.left.y = 0;
    polygon.vertices[3].controls.right.y = 0;
    polygon.vertices[6].x = -polygon.vertices[4].x;
    polygon.vertices[6].y = polygon.vertices[4].y;
    polygon.vertices[6].command = Two.Commands.curve;
    polygon.vertices[6].controls.right.y = 133;
    polygon.vertices[6].controls.left.y = 261;
    polygon.vertices.push(polygon.vertices[3].clone());
    polygon.vertices[7].command = Two.Commands.curve;

    // Add second set of same vertices so path can wrap
    polygon.vertices.push(polygon.vertices[0].clone());
    polygon.vertices.push(polygon.vertices[1].clone());
    polygon.vertices.push(polygon.vertices[2].clone());
    polygon.vertices.push(polygon.vertices[3].clone());
    polygon.vertices.push(polygon.vertices[4].clone());
    polygon.vertices.push(polygon.vertices[5].clone());
    polygon.vertices.push(polygon.vertices[6].clone());
    polygon.vertices.push(polygon.vertices[7].clone());

    // Animation
    polygon.beginning = 0.03;
    polygon.subdivide([2]);
    polygon.ending = 0.4;

    anitype.addTween(polygon, {
      to: { ending: 0.93 },
      duration: 0.6,
      start: 0.3,
      easing: Anitype.Easing.Linear.In,
    });

    anitype.addTween(polygon, {
      to: { beginning: 0.56 },
      duration: 0.6,
      start: 0.3,
      easing: Anitype.Easing.Linear.In,
    });

    // Return your polygon wrapped in a group.
    return two.makeGroup(polygon);
  },
});

//-------------------------------

Anitype.register("E", {
  // Enter your name
  author: "Ron Kim",

  // Enter a personal website, must have http
  website: "http://ronaldhkim.com/",

  // Make your animation here
  construct: function (two, points) {
    // Reference to instance
    var anitype = this;

    // Create a Two.Polygon
    var polygon = anitype.makePolygon(points);
    // Set an initial state
    polygon.scale = 1;

    //Remember original x-coords of vertices to animate
    var original_xvertices = [];
    original_xvertices[4] = -155;
    original_xvertices[5] = 0;

    //Remember original y-coords of vertices to animate
    var original_yvertices = [];
    original_yvertices[1] = -325;
    original_yvertices[0] = -325;

    // Designate starting location of crossbar (offscreen)
    var x_offscreen = -3000;
    // Designate starting locations of vertical and top stem
    var y_baseline = 335;

    //Start with top stem collapsed on baseline
    polygon.vertices[0].y = y_baseline;
    polygon.vertices[1].y = y_baseline;

    //Start with crossbar offscreen to left
    polygon.vertices[4].x = x_offscreen;
    polygon.vertices[5].x = x_offscreen;

    // Create the animation via a tween
    //Animate the letter
    //Have top stem rise up from baseline and whip up
    this.addTween(polygon.vertices[0], {
      to: { y: original_yvertices[0] },
      easing: Anitype.Easing.Sinusoidal.Out,
      duration: 0.5,
      start: 0,
      update: function () {
        anitype.addTween(polygon.vertices[1], {
          to: { y: original_yvertices[1] },
          easing: Anitype.Easing.Elastic.Out,
          duration: 0.4,
          start: 0.0,
          //Then, have crossbar shoot in from left
          complete: function () {
            anitype.addTween(polygon.vertices[4], {
              to: { x: original_xvertices[4] },
              easing: Anitype.Easing.Bounce.Out,
              duration: 0.5,
              start: 0.3,
              update: function () {
                anitype.addTween(polygon.vertices[5], {
                  to: { x: original_xvertices[5] },
                  easing: Anitype.Easing.Bounce.Out,
                  duration: 0.5,
                  start: 0.3,
                });
              },
            });
          },
        });
      },
    });

    // Return your polygon wrapped in a group.
    return two.makeGroup(polygon);
  },
});

//-------------------------------

/**
 * Register your submission and choose a character
 * For more information check out the documentation
 * http://anitype.com/documentation
 */
Anitype.register("M", {
  // Enter your name
  author: "Matthew Kellogg",

  // Enter a personal website, must have http
  website: "",

  // Make your animation here
  construct: function (two, points) {
    // Reference to instance
    var anitype = this;

    // Create a Two.Polygon
    var polygon = anitype.makePolygon(points);
    polygon.subdivide(10);
    // Set an initial state
    //polygon.scale = 0;
    var verts = polygon.vertices;
    var lerp = function (i) {
      anitype.addTween(verts[i], {
        to: { x: verts[i].x, y: verts[i].y },
        from: { x: 0, y: verts[0].y },
        easing: Anitype.Easing.Elastic.Out,
        duration: 0.35,
        start: 0.2 + 0.5 * ((1.0 * i) / (verts.length - 1)),
      });
    };

    for (var i = 1; i < verts.length; i++) {
      lerp(i);
    }

    // Return your polygon wrapped in a group.
    return two.makeGroup(polygon);
  },
});

//-------------------------------

/**
 * Register your submission and choose a character
 * For more information check out the documentation
 * http://anitype.com/documentation
 */
Anitype.register("O", {
  // Enter your name
  author: "LValley",

  // Enter a personal website, must have http
  website: "http://digital-love.squarespace.com/",

  // Make your animation here
  construct: function (two, points) {
    // Reference to instance
    var anitype = this;
    //var x = 0;

    var line_1 = two.makeLine(-700, 329, -215, -329);
    var line_2 = two.makeLine(-600, 329, -215, -329);
    var line_3 = two.makeLine(-500, 329, -215, -329);
    var line_4 = two.makeLine(-400, 329, -215, -329);
    var line_5 = two.makeLine(-300, 329, -215, -329);
    var line_6 = two.makeLine(-200, 329, -215, -329);
    var line_7 = two.makeLine(-100, 329, -215, -329);
    var line_8 = two.makeLine(0, 329, -215, -329);
    var line_9 = two.makeLine(100, 329, -215, -329);
    var line_10 = two.makeLine(200, 329, -215, -329);
    var line_11 = two.makeLine(300, 329, -215, -329);
    var line_12 = two.makeLine(400, 329, -215, -329);
    var line_13 = two.makeLine(500, 329, -215, -329);
    var line_14 = two.makeLine(600, 329, -215, -329);
    var line_15 = two.makeLine(700, 329, -215, -329);
    var line_16 = two.makeLine(800, 329, -215, -329);
    var line_17 = two.makeLine(900, 329, -215, -329);
    var line_18 = two.makeLine(1000, 329, -215, -329);
    var line_19 = two.makeLine(1100, 329, -215, -329);

    var line_20 = two.makeLine(-700, 0, -215, -329);
    var line_21 = two.makeLine(-600, 0, -215, -329);
    var line_22 = two.makeLine(-500, 0, -215, -329);
    var line_23 = two.makeLine(-400, 0, -215, -329);
    var line_24 = two.makeLine(-300, 0, -215, -329);
    var line_25 = two.makeLine(-200, 0, -215, -329);

    var line_33 = two.makeLine(600, 0, -215, -329);
    var line_34 = two.makeLine(700, 0, -215, -329);
    var line_35 = two.makeLine(800, 0, -215, -329);
    var line_36 = two.makeLine(900, 0, -215, -329);
    var line_37 = two.makeLine(1000, 0, -215, -329);
    var line_38 = two.makeLine(1100, 0, -215, -329);

    var line_39 = two.makeLine(-700, -329, -215, -329);

    var line_57 = two.makeLine(1100, -329, -215, -329);

    var line_58 = two.makeLine(-700, -658, -215, -329);

    var line_76 = two.makeLine(1100, -658, -215, -329);

    var line_77 = two.makeLine(-700, -987, -215, -329);
    var line_78 = two.makeLine(-600, -987, -215, -329);
    var line_79 = two.makeLine(-500, -987, -215, -329);
    var line_80 = two.makeLine(-400, -987, -215, -329);

    var line_92 = two.makeLine(800, -987, -215, -329);
    var line_93 = two.makeLine(900, -987, -215, -329);
    var line_94 = two.makeLine(1000, -987, -215, -329);
    var line_95 = two.makeLine(1100, -987, -215, -329);
    //row_6
    var line_96 = two.makeLine(-700, -1316, -215, -329);
    var line_97 = two.makeLine(-600, -1316, -215, -329);
    var line_98 = two.makeLine(-500, -1316, -215, -329);
    var line_99 = two.makeLine(-400, -1316, -215, -329);
    var line_100 = two.makeLine(-300, -1316, -215, -329);
    var line_101 = two.makeLine(-200, -1316, -215, -329);
    var line_102 = two.makeLine(-100, -1316, -215, -329);
    var line_103 = two.makeLine(0, -1316, -215, -329);
    var line_104 = two.makeLine(100, -1316, -215, -329);
    var line_105 = two.makeLine(200, -1316, -215, -329);
    var line_106 = two.makeLine(300, -1316, -215, -329);
    var line_107 = two.makeLine(400, -1316, -215, -329);
    var line_108 = two.makeLine(500, -1316, -215, -329);
    var line_109 = two.makeLine(600, -1316, -215, -329);
    var line_110 = two.makeLine(700, -1316, -215, -329);
    var line_111 = two.makeLine(800, -1316, -215, -329);
    var line_112 = two.makeLine(900, -1316, -215, -329);
    var line_113 = two.makeLine(1000, -1316, -215, -329);
    var line_114 = two.makeLine(1100, -1316, -215, -329);

    line_1.vertices[0].set(0, 450);
    line_1.vertices[1].set(0, 350);

    //line_2
    line_2.vertices[0].set(0, 450);
    line_2.vertices[1].set(0, 350);

    //line_3
    line_3.vertices[0].set(0, 450);
    line_3.vertices[1].set(0, 350);

    line_4.vertices[0].set(0, 450);
    line_4.vertices[1].set(0, 350);

    //line_2
    line_5.vertices[0].set(0, 450);
    line_5.vertices[1].set(0, 350);

    //line_3
    line_6.vertices[0].set(0, 450);
    line_6.vertices[1].set(0, 350);

    line_7.vertices[0].set(0, 450);
    line_7.vertices[1].set(0, 350);

    //line_2
    line_8.vertices[0].set(0, 450);
    line_8.vertices[1].set(0, 350);

    //line_3
    line_9.vertices[0].set(0, 450);
    line_9.vertices[1].set(0, 350);

    line_10.vertices[0].set(0, 450);
    line_10.vertices[1].set(0, 350);

    //line_2
    line_11.vertices[0].set(0, 450);
    line_11.vertices[1].set(0, 350);

    //line_3
    line_12.vertices[0].set(0, 450);
    line_12.vertices[1].set(0, 350);

    //line_3
    line_13.vertices[0].set(0, 450);
    line_13.vertices[1].set(0, 350);

    line_14.vertices[0].set(0, 450);
    line_14.vertices[1].set(0, 350);

    //line_2
    line_15.vertices[0].set(0, 450);
    line_15.vertices[1].set(0, 350);

    //line_3
    line_16.vertices[0].set(0, 450);
    line_16.vertices[1].set(0, 350);

    line_17.vertices[0].set(0, 450);
    line_17.vertices[1].set(0, 350);

    //line_2
    line_18.vertices[0].set(0, 450);
    line_18.vertices[1].set(0, 350);

    //line_3
    line_19.vertices[0].set(0, 450);
    line_19.vertices[1].set(0, 350);

    //line_3
    line_22.vertices[0].set(0, 450);
    line_22.vertices[1].set(0, 350);

    //line_3
    line_23.vertices[0].set(0, 450);
    line_23.vertices[1].set(0, 350);

    line_24.vertices[0].set(0, 450);
    line_24.vertices[1].set(0, 350);

    //line_2
    line_25.vertices[0].set(0, 450);
    line_25.vertices[1].set(0, 350);

    //     //line_3
    line_20.vertices[0].set(0, 450);
    line_20.vertices[1].set(0, 350);

    line_21.vertices[0].set(0, 450);
    line_21.vertices[1].set(0, 350);

    //line_3
    line_33.vertices[0].set(0, 450);
    line_33.vertices[1].set(0, 350);

    line_34.vertices[0].set(0, 450);
    line_34.vertices[1].set(0, 350);

    //line_2
    line_35.vertices[0].set(0, 450);
    line_35.vertices[1].set(0, 350);

    line_39.vertices[0].set(0, 450);
    line_39.vertices[1].set(0, 350);

    // //line_2
    line_36.vertices[0].set(0, 450);
    line_36.vertices[1].set(0, 350);

    //     //line_3
    line_37.vertices[0].set(0, 450);
    line_37.vertices[1].set(0, 350);

    //     //line_3
    line_38.vertices[0].set(0, 450);
    line_38.vertices[1].set(0, 350);

    line_57.vertices[0].set(0, 450);
    line_57.vertices[1].set(0, 350);

    // //line_2
    line_58.vertices[0].set(0, 450);
    line_58.vertices[1].set(0, 350);

    //     //line_3
    line_76.vertices[0].set(0, 450);
    line_76.vertices[1].set(0, 350);

    line_77.vertices[0].set(0, 450);
    line_77.vertices[1].set(0, 350);

    //line_2
    line_78.vertices[0].set(0, 450);
    line_78.vertices[1].set(0, 350);

    line_79.vertices[0].set(0, 450);
    line_79.vertices[1].set(0, 350);

    line_80.vertices[0].set(0, 450);
    line_80.vertices[1].set(0, 350);

    line_92.vertices[0].set(0, 450);
    line_92.vertices[1].set(0, 350);

    //     //line_3
    line_93.vertices[0].set(0, 450);
    line_93.vertices[1].set(0, 350);

    line_94.vertices[0].set(0, 450);
    line_94.vertices[1].set(0, 350);

    //line_2
    line_95.vertices[0].set(0, 450);
    line_95.vertices[1].set(0, 350);

    //line_3
    line_96.vertices[0].set(0, 450);
    line_96.vertices[1].set(0, 350);

    line_97.vertices[0].set(0, 450);
    line_97.vertices[1].set(0, 350);

    //line_2
    line_98.vertices[0].set(0, 450);
    line_98.vertices[1].set(0, 350);

    //line_3
    line_99.vertices[0].set(0, 450);
    line_99.vertices[1].set(0, 350);

    line_100.vertices[0].set(0, 450);
    line_100.vertices[1].set(0, 350);

    //line_2
    line_101.vertices[0].set(0, 450);
    line_101.vertices[1].set(0, 350);

    //line_3
    line_102.vertices[0].set(0, 450);
    line_102.vertices[1].set(0, 350);

    //line_3
    line_103.vertices[0].set(0, 450);
    line_103.vertices[1].set(0, 350);

    line_104.vertices[0].set(0, 450);
    line_104.vertices[1].set(0, 350);

    //line_2
    line_105.vertices[0].set(0, 450);
    line_105.vertices[1].set(0, 350);

    //line_3
    line_106.vertices[0].set(0, 450);
    line_106.vertices[1].set(0, 350);

    line_107.vertices[0].set(0, 450);
    line_107.vertices[1].set(0, 350);

    //line_2
    line_108.vertices[0].set(0, 450);
    line_108.vertices[1].set(0, 350);

    //line_3
    line_109.vertices[0].set(0, 450);
    line_109.vertices[1].set(0, 350);

    line_110.vertices[0].set(0, 450);
    line_110.vertices[1].set(0, 350);

    //line_2
    line_111.vertices[0].set(0, 450);
    line_111.vertices[1].set(0, 350);

    //line_3
    line_112.vertices[0].set(0, 450);
    line_112.vertices[1].set(0, 350);

    //line_3
    line_113.vertices[0].set(0, 450);
    line_113.vertices[1].set(0, 350);

    line_114.vertices[0].set(0, 450);
    line_114.vertices[1].set(0, 350);

    //Create the animation via a tween
    function moveVert(vert, x1, x2, y1, y2, start, duration) {
      anitype.addTween(line_5, {
        to: { x: 0, y: -1000 },
        easing: Anitype.Easing.Linear.Out,
        update: function () {
          anitype.addTween(vert, {
            to: { x: x2, y: y2 },
            easing: Anitype.Easing.Elastic.Out,
            duration: duration,
            start: start,
          });
        },
        duration: duration, // Value from 0 - 1
        start: start, // Value from 0 - 1
      });
    }
    //Create the animation via a tween
    function moveVert1(vert, x1, x2, y1, y2, start, duration) {
      anitype.addTween(line_3, {
        to: { x: 0, y: 1000 },
        easing: Anitype.Easing.Linear.Out,
        update: function () {
          anitype.addTween(vert, {
            to: { x: x2, y: y2 },
            easing: Anitype.Easing.Elastic.Out,
            duration: duration,
            start: start,
          });
        },
        duration: duration, // Value from 0 - 1
        start: start, // Value from 0 - 1
      });
    }

    //moveVert(line_1.vertices[1],0,215,-329,-329,0,.5);
    //moveVert(line_10.vertices[1],0,-215,-329,-100,.25,.75);
    moveVert(line_3.vertices[1], 0, -215, -329, -800, 0.4, 0.75);
    moveVert(line_5.vertices[1], 0, -215, -329, -250, 0.4, 0.45);
    moveVert(line_7.vertices[1], 0, -215, -329, 70, 0.2, 0.75);
    moveVert(line_9.vertices[1], 0, -215, -329, 250, 0.2, 0.75);

    moveVert(line_11.vertices[1], 0, 215, -329, 250, 0.2, 0.75);
    moveVert(line_13.vertices[1], 0, 215, -329, 0, 0.2, 0.75);
    moveVert(line_15.vertices[1], 0, 215, -329, -250, 0.4, 0.75);
    moveVert(line_17.vertices[1], 0, 215, -329, -800, 0.4, 0.75);

    //moveVert(line_19.vertices[1],0,-215,-329,-800,.25,.5);
    moveVert(line_22.vertices[1], 0, -215, -329, -250, 0.5, 0.75);
    moveVert(line_24.vertices[1], 0, -215, -329, 70, 0.5, 0.75);
    moveVert(line_25.vertices[1], 0, -215, -329, 250, 0.5, 0.75);

    moveVert(line_33.vertices[1], 0, 215, -329, 250, 0.5, 0.75);
    moveVert(line_34.vertices[1], 0, 215, -329, 0, 0.5, 0.75);
    moveVert(line_35.vertices[1], 0, 215, -329, -250, 0.5, 0.75);

    //top

    //moveVert(line_1.vertices[1],0,215,-329,-329,0,.5);
    //moveVert(line_10.vertices[1],0,-215,-329,-100,.25,.75);
    moveVert(line_104.vertices[0], 0, -215, -329, 550, 0.2, 0.75);
    moveVert(line_106.vertices[0], 0, 215, -329, 550, 0.2, 0.75);
    moveVert(line_102.vertices[0], 0, -215, -329, 700, 0.2, 0.75);
    moveVert(line_108.vertices[0], 0, 215, -329, 700, 0.2, 0.75);

    moveVert(line_100.vertices[0], 0, -215, -329, 900, 0.5, 0.75);
    moveVert(line_110.vertices[0], 0, 215, -329, 900, 0.5, 0.75);
    moveVert(line_98.vertices[0], 0, -215, -329, 1100, 0.5, 0.75);
    moveVert(line_112.vertices[0], 0, 215, -329, 1100, 0.25, 0.75);

    moveVert(line_78.vertices[0], 0, -215, -329, 1300, 0.4, 0.75);
    moveVert(line_94.vertices[0], 0, 215, -329, 1300, 0.4, 0.75);

    // Return your polygon wrapped in a group.
    return two.makeGroup(
      line_1,
      line_2,
      line_3,
      line_4,
      line_5,
      line_6,
      line_7,
      line_8,
      line_9,
      line_10,
      line_11,
      line_12,
      line_13,
      line_14,
      line_15,
      line_16,
      line_17,
      line_18,
      line_19,
      line_20,
      line_21,
      line_22,
      line_23,
      line_24,
      line_25,
      line_33,
      line_34,
      line_35,
      line_36,
      line_37,
      line_38,
      line_39,
      line_57,
      line_58,
      line_76,
      line_77,
      line_78,
      line_79,
      line_80,
      line_92,
      line_93,
      line_94,
      line_95,
      line_96,
      line_97,
      line_98,
      line_99,
      line_100,
      line_101,
      line_102,
      line_103,
      line_104,
      line_105,
      line_106,
      line_107,
      line_108,
      line_109,
      line_110,
      line_111,
      line_112,
      line_113,
      line_114,
    );
  },
});

//-------------------------------

Anitype.register("L", {
  // Enter your name
  author: "dave",

  // Enter a personal website, must have http
  website: "http://anitype.com/",

  // Make your animation here
  construct: function (two, points) {
    // Reference to instance
    var anitype = this;

    // Create a Two.Polygon
    var polygon = anitype.makePolygon(points);

    // set up vars
    var p1 = polygon.vertices[0];
    var p2 = polygon.vertices[1];
    var p3 = polygon.vertices[2];

    // Set an initial state
    polygon.scale = 1;
    p1.set(-50, 200);
    p2.set(300, 50);
    p3.set(350, 200);

    var op1x = p1.x;
    var op1y = p1.y;
    var op2x = p2.x;
    var op2y = p2.y;
    var op3x = p3.x;
    var op3y = p3.y;

    // Create the animation via a tween
    // front leg

    anitype.addTween(p1, {
      to: { x: op1x - 100, y: op1y - 200 }, //step up 1
      duration: 0.09,
      start: 0,
      complete: function () {
        anitype.addTween(p1, {
          //step down 1
          to: { x: op1x - 150, y: op1y },
          //easing: Anitype.Easing.Elastic.Out,
          duration: 0.14,
          start: 0.07,
          complete: function () {
            anitype.addTween(p1, {
              //step up 2
              to: { x: op1x - 160, y: op1y - 75 },
              duration: 0.09,
              start: 0.4,
              complete: function () {
                anitype.addTween(p1, {
                  // step down 2
                  to: { x: op1x - 200, y: op1y },
                  easing: Anitype.Easing.Elastic.Out,
                  duration: 0.14,
                  start: 0.55,
                });
              },
            });
          },
        });
      },
    });

    // middle body
    anitype.addTween(p2, {
      to: { x: op2x - 150, y: op2y },
      duration: 0.4,
      start: 0,
      complete: function () {
        anitype.addTween(p2, {
          to: { x: op2x - 200, y: op2y + 150 },
          easing: Anitype.Easing.Elastic.Out,
          duration: 0.4,
          start: 0.55,
        });
      },
    });

    // back leg
    anitype.addTween(p3, {
      to: { x: op3x - 50, y: op3y - 50 },
      duration: 0.07,
      start: 0.25,
      complete: function () {
        anitype.addTween(p3, {
          to: { x: op3x - 100, y: op3y },
          duration: 0.07,
          start: 0.33,
          complete: function () {
            anitype.addTween(p3, {
              to: { x: op3x - 105, y: op3y },
              duration: 0.2,
              start: 0.7,
            });
          },
        });
      },
    });

    // Return your polygon wrapped in a group.
    return two.makeGroup(polygon);
  },
});

//-------------------------------

Anitype.register("4", {
  author: "dantasse",
  website: "http://www.dantasse.com/",

  construct: function (two, points) {
    var anitype = this;

    var angle = anitype.makePolygon(points.slice(0, 3));
    var vertbar = anitype.makePolygon(points.slice(3, 5));

    angle.translation.x = 700;
    angle.translation.y = -700;
    vertbar.translation.y = -900;
    anitype.addTween(angle.translation, {
      to: { x: 0, y: 0 },
      easing: Anitype.Easing.Quartic.Out,
      duration: 0.5,
      start: 0,
    });
    anitype.addTween(vertbar.translation, {
      to: { x: 0, y: 0 },
      easing: Anitype.Easing.Exponential.In,
      duration: 0.2,
      start: 0.5,
    });

    return two.makeGroup(angle, vertbar);
  },
});

/**
 * Register your submission and choose a character
 * For more information check out the documentation
 * http://anitype.com/documentation
 */
Anitype.register("Q", {
  // Enter your name
  author: "chenliang",

  // Enter a personal website, must have http
  website: "http://liangchen1ce.github.io/",

  // Make your animation here
  construct: function (two, points) {
    // Reference to instance
    var anitype = this;

    // Create a Two.Polygon
    var circle = anitype.makePolygon(points.slice(0, 5));
    var bar = anitype.makePolygon(points.slice(5, 7));

    // Create the animation via a tween
    anitype.addTween(bar, {
      from: { scale: 1.0, rotation: 0 },
      to: { scale: 1.0, rotation: -Math.PI / 8 },
      easing: Anitype.Easing.Elastic.Out,
      duration: 0.5, // Value from 0 - 1
      start: 0.5, // Value from 0 - 1
    });

    anitype.addTween(circle, {
      from: { scale: 1.0, rotation: 0 },
      to: { scale: 1.0, rotation: Math.PI },
      easing: Anitype.Easing.Elastic.InOut,
      duration: 0.5, // Value from 0 - 1
      start: 0, // Value from 0 - 1
    });

    // Return your polygon wrapped in a group.
    return two.makeGroup(circle, bar);
  },
});

//-------------------------------
// 2014 recovered submissions
//-------------------------------

/**
 * Register your submission and choose a character
 * For more information check out the documentation
 * http://anitype.com/documentation
 */
Anitype.register("B", {
  // Enter your name
  author: "Andre Le",

  // Enter a personal website, must have http
  website: "http://andrele.com/",

  // Make your animation here
  construct: function (two, points) {
    // Reference to instance
    var anitype = this;

    // Create a Two.Polygon

    var polygon = anitype.makePolygon(points);

    var spine = anitype.makePolygon([polygon.vertices[0], polygon.vertices[1]]);

    polygon = polygon.subdivide();

    // Set an initial state
    polygon.scale = 1;

    var time = { value: 0 };
    anitype.addTween(time, {
      to: { value: 1 },
      easing: Anitype.Easing.Sinusoidal.InOut,
      duration: 0.8,
      start: 0,
      update: function () {
        if (this.value < 1 / 2) {
          polygon.beginning = this.value * 2;
        } else {
          polygon.beginning = 0;
          polygon.ending = (this.value - 0.5) * 2;
        }
      },
    });

    // Return your polygon wrapped in a group.
    return two.makeGroup(spine, polygon);
  },
});

//------------------------

Anitype.register("C", {
  // Enter your name
  author: "Andrew Russell",

  // Enter a personal website, must have http
  website: "http://ajrussell.ca/",

  construct: function (two, points) {
    var anitype = this;

    var reference = [
      points[0].clone(),
      points[1].clone(),
      points[2].clone(),
      points[3].clone(),
      points[4].clone(),
    ];

    var polygon = anitype.makePolygon(points);

    var fold_length = 0.35;
    var spin_length = 0.4;

    anitype.addTween(points[1], {
      to: { y: 0, ly: 0, ry: 0 },
      easing: Anitype.Easing.Quadratic.InOut,
      duration: fold_length,
      start: 0,
      update: function () {
        anitype.addTween(points[1], {
          to: { y: reference[1].y, ly: reference[1].ly, ry: reference[1].ry },
          easing: Anitype.Easing.Quadratic.InOut,
          duration: fold_length,
          start: 1 - fold_length,
        });
      },
    });

    anitype.addTween(points[3], {
      to: { y: 0, ly: 0, ry: 0 },
      easing: Anitype.Easing.Quadratic.InOut,
      duration: fold_length,
      start: 0,
      update: function () {
        anitype.addTween(points[3], {
          to: { y: reference[3].y, ly: reference[3].ly, ry: reference[3].ry },
          easing: Anitype.Easing.Quadratic.InOut,
          duration: fold_length,
          start: 1 - fold_length,
        });
      },
    });

    anitype.addTween(points[0], {
      to: { y: 0 },
      easing: Anitype.Easing.Quadratic.InOut,
      duration: fold_length,
      start: 0,
      update: function () {
        anitype.addTween(points[0], {
          to: { y: reference[0].y },
          easing: Anitype.Easing.Quadratic.InOut,
          duration: fold_length,
          start: 1 - fold_length,
        });
      },
    });

    anitype.addTween(points[4], {
      to: { y: 0 },
      easing: Anitype.Easing.Quadratic.InOut,
      duration: fold_length,
      start: 0,
      update: function () {
        anitype.addTween(points[4], {
          to: { y: reference[4].y },
          easing: Anitype.Easing.Quadratic.InOut,
          duration: fold_length,
          start: 1 - fold_length,
        });
      },
    });

    anitype.addTween(polygon, {
      to: { rotation: -2 * 3.141 },
      easing: Anitype.Easing.Sinusoidal.InOut,
      duration: spin_length,
      start: 0.5 - spin_length / 2,
    });

    return two.makeGroup(polygon);
  },
});

//----------------------------------

Anitype.register("/", {
  // Enter your name
  author: "Andrew Russell",

  // Enter a personal website, must have http
  website: "http://ajrussell.ca/",

  // Make your animation here
  construct: function (two, points) {
    // Reference to instance
    var anitype = this;

    var top = 369;

    var left_middle = new Two.Anchor(0, 0);
    var right_middle = new Two.Anchor(0, 0);
    right_middle.command = "L";

    // Create a Two.Polygon
    var left = anitype.makePolygon([left_middle, points[1]]);
    var right = anitype.makePolygon([points[0], right_middle]);

    var ease_type = Anitype.Easing.Quadratic.In;
    var length = 0.1;

    anitype.addTween(points[0], {
      to: { y: top },
      easing: ease_type,
      start: 0,
      duration: length,
      update: function () {
        anitype.addTween(points[0], {
          to: { y: -top },
          easing: ease_type,
          start: 0.5,
          duration: length,
        });
      },
    });

    anitype.addTween(points[1], {
      to: { y: -top },
      easing: ease_type,
      start: 0.25,
      duration: length,
      update: function () {
        anitype.addTween(points[1], {
          to: { y: top },
          easing: ease_type,
          start: 0.75,
          duration: length,
        });
      },
    });

    return two.makeGroup(right, left);
  },
});

//----------------------------------

/**
 * Register your submission and choose a character
 * For more information check out the documentation
 * http://anitype.com/documentation
 */
Anitype.register("D", {
  // Enter your name
  author: "Andrew Sweet",

  // Enter a personal website, must have http
  website: "http://www.linkedin.com/pub/andrew-sweet/58/93/735/",

  // Make your animation here
  construct: function (two, points) {
    // Reference to instance
    var anitype = this;

    // Create a Two.Polygon
    //var polygon = anitype.makePolygon(points);

    var leftD = points[0].x;
    var rightD = points[3].x;

    var p0 = points[0];
    var p1 = points[1];
    var p2 = points[2];
    var p3 = points[3];
    var p4 = points[4];

    var c0 = points[1].clone();

    var midY = (p1.y + p4.y) / 2.0;
    var radius = (p4.y - midY) / 2.0;

    c0.x = rightD;
    c0.y = p4.y;

    var c1 = c0.clone();
    var c2 = c0.clone();
    var c3 = c0.clone();

    var midX = c0.x - radius;
    midY = c0.y - radius;

    var bezDist = radius / 2.3;

    var anchorBR = new Two.Anchor(c0.x, c0.y);
    var anchorBL = new Two.Anchor(c0.x - 2 * radius, c0.y);
    var anchorTL = new Two.Anchor(c0.x - 2 * radius, c0.y - 2 * radius);
    var anchorTR = new Two.Anchor(c0.x, c0.y - 2 * radius);

    c0 = new Two.Anchor(
      c0.x,
      c0.y,
      anchorTR.x,
      anchorTR.y + bezDist,
      anchorBR.x,
      anchorBR.y - bezDist,
      Two.Commands.curve,
    );

    c1 = new Two.Anchor(
      c1.x,
      c1.y,
      anchorBR.x - bezDist,
      anchorBR.y,
      anchorBL.x + bezDist,
      anchorBL.y,
      Two.Commands.curve,
    );

    c2 = new Two.Anchor(
      c2.x,
      c2.y,
      anchorBL.x,
      anchorBL.y - bezDist,
      anchorTL.x,
      anchorTL.y + bezDist,
      Two.Commands.curve,
    );

    c3 = new Two.Anchor(
      c3.x,
      c3.y,
      anchorTL.x + bezDist,
      anchorTL.y,
      anchorTR.x - bezDist,
      anchorTR.y,
      Two.Commands.curve,
    );

    c0.y -= radius;
    c1.x -= radius;
    c2.x -= 2 * radius;
    c2.y -= radius;
    c3.x -= radius;
    c3.y -= 2 * radius;

    var delay = 0.3;

    var circle = anitype.makePolygon([c0, c1, c2, c3, c0]);
    circle.beginning = 0;
    circle.ending = 0;

    var poly1 = anitype.makePolygon([p0, p1]);

    // Move Line
    anitype.addTween(poly1.translation, {
      to: { x: rightD + 174 },
      easing: Anitype.Easing.Sinusoidal.InOut,
      duration: 0.3,
      start: 0.0 + delay,
    });

    // Create a Two.Polygon
    var poly2 = anitype.makePolygon([p1, p2, p3, p4]).subdivide(20);
    circle = circle.subdivide(20);

    var offset = 0.03;

    // Handle Wipes
    var time = { value: 0 };
    anitype.addTween(time, {
      to: { value: 0.98 },
      duration: 0.3,
      start: 0.02 + delay,
      update: function () {
        if (this.value < 0.9) {
          poly2.beginning = this.value / 3.0; // * 2;
          poly2.ending = 1 - this.value / 3.0 + 0.02;

          circle.beginning = 0.5 - offset - this.value / 2;
          circle.ending = 0.5 + offset + this.value / 2;
        } else {
          poly2.beginning = 1;
          circle.beginning = 0.03;
          circle.ending = 0.97;
        }
      },
    });

    // Return your polygon wrapped in a group.
    return two.makeGroup(poly1, poly2, circle);
  },
});

//-----------------------------

/**
 * Register your submission and choose a character
 * For more information check out the documentation
 * http://anitype.com/documentation
 */
Anitype.register("H", {
  author: "Andrew Sweet",

  // Enter a kickback website, must have http
  website: "http://www.linkedin.com/pub/andrew-sweet/58/93/735/",

  construct: function (two, points) {
    var anitype = this;

    //Top Left
    var p0 = points[0];
    //Bottom Left
    var p1 = points[1];

    //Top Right
    var p2 = points[2];
    //Bottom Right
    var p3 = points[3];

    //Left Mid
    var p4 = points[4];
    //Right Mid
    var p5 = points[5];

    var leftLine = anitype.makePolygon([p0, p1]);
    var rightLine = anitype.makePolygon([p2, p3]);
    var midLine = anitype.makePolygon([p4, p5]);

    var c0 = p3.clone();
    var c2 = p1.clone();
    var c1 = new Two.Anchor(0, p4.y);

    var radius = (c0.x - c2.x) / 2.0;

    var midX = c0.x - radius;
    midY = c0.y - radius;

    var bezDist = 0.1; //radius/2.3;

    var anchorTL = new Two.Anchor(c2.x, c1.y);
    var anchorTR = new Two.Anchor(c0.x, c1.y);

    c0 = new Two.Anchor(
      c0.x,
      c0.y,
      anchorTR.x - 3,
      anchorTR.y + bezDist + 300,
      c0.x,
      c0.y,
      Two.Commands.curve,
    );

    c1 = new Two.Anchor(
      c1.x,
      c1.y,
      anchorTR.x,
      anchorTR.y,
      anchorTL.x + bezDist,
      anchorTL.y,
      Two.Commands.curve,
    );

    c2 = new Two.Anchor(
      c2.x,
      c2.y,
      c2.x,
      c2.y - bezDist,
      anchorTL.x,
      anchorTL.y,
      Two.Commands.curve,
    );

    /*c0.command = Two.Commands.line;
    c1.command = Two.Commands.line;
    c2.command = Two.Commands.line;*/

    var curve = anitype.makePolygon([c0, c1, c2]);

    midLine = midLine.subdivide(30);
    curve = curve.subdivide(20);

    // Don't close the polygon
    curve.beginning = 0.02;
    curve.ending = 0;

    //var offset = 0.03;
    var delay = 0.3;

    // Move Line
    anitype.addTween(rightLine.translation, {
      to: { x: -355 },
      easing: Anitype.Easing.Sinusoidal.InOut,
      duration: 0.3,
      start: delay,
    });

    // Handle Wipes
    var time = { value: 0 };
    anitype.addTween(time, {
      to: { value: 0.98 },
      duration: 0.3,
      start: delay,
      update: function () {
        midLine.ending = 1 - this.value;
        curve.ending = this.value;
      },
    });

    var result = two.makeGroup(leftLine, rightLine, midLine, curve);
    return result;
  },
});

//---------------------

/**
/**
 * Register your submission and choose a character
 * For more information check out the documentation
 * http://anitype.com/documentation
 */
Anitype.register("G", {
  author: "Celine Nguyen",
  website: "http://celinenguyen.com/",

  construct: function (two, points) {
    var anitype = this;
    var polygon = anitype.makePolygon(points);

    var easingType = Anitype.Easing.Quadratic.In;
    var closedX = points[0].x - 10;
    var closedY = points[0].y;
    var insideX = closedX - 100;
    var insideY = closedY + 55;
    var outsideX = closedX + 110;
    var outsideY = insideY;
    var downX = points[5].x;
    var downY = points[5].y;
    var flipDuration = 0.1;

    anitype.addTween(points[5], {
      to: { x: closedX, y: closedY },
      easing: easingType,
      duration: flipDuration,
      start: flipDuration,
      complete: function () {
        anitype.addTween(points[5], {
          to: { x: outsideX, y: outsideY },
          easing: easingType,
          duration: flipDuration,
          start: 2 * flipDuration,
          complete: function () {
            anitype.addTween(points[5], {
              to: { x: closedX, y: closedY },
              easing: easingType,
              duration: flipDuration,
              start: 3 * flipDuration,
              complete: function () {
                anitype.addTween(points[5], {
                  to: { x: downX, y: downY },
                  easing: easingType,
                  duration: flipDuration,
                  start: 4 * flipDuration,
                });
              },
            });
          },
        });
      },
    });

    return two.makeGroup(polygon);
  },
});

//--------------------------------

Anitype.register("G", {
  // Enter your name
  author: "chanamonster",

  // Enter a personal website, must have http
  website: "http://chanamon.com/",

  // Make your animation here
  construct: function (two, points) {
    // Reference to instance
    var anitype = this;

    // Create a Two.Polygon
    var polygon = anitype.makePolygon(points);

    var pt0 = points[0].clone();
    var pt1 = points[1].clone();
    var pt2 = points[2].clone();
    var pt3 = points[3].clone();
    var pt4 = points[4].clone();
    var pt5 = points[5].clone();

    var curve = anitype.makePolygon([pt0, pt1, pt2, pt3, pt4]);
    curve.subdivide();
    curve.ending = 0;

    pt4 = new Two.Anchor(pt4.x, pt4.y);
    var lip = anitype.makePolygon([pt4, pt5]);
    lip.vertices[1].set(pt4.x, pt4.y);
    lip.ending = 0;

    //draw curve
    anitype.addTween(curve, {
      to: { scale: 1, ending: 1 },
      duration: 0.5,
      start: 0.01,
    });

    //draw lip
    anitype.addTween(lip, {
      to: { ending: 1 },
      duration: 0.1,
      start: 0.45,
    });
    anitype.addTween(lip.vertices[1], {
      to: { x: 175, y: -175 },
      duration: 0.1,
      start: 0.45,
      complete: function () {
        //move lip down
        anitype.addTween(lip.vertices[1], {
          to: { x: 0, y: 10 },
          easing: Anitype.Easing.Bounce.Out,
          duration: 0.25,
          start: 0.7,
        });
      },
    });

    // Return your polygon wrapped in a group.
    return two.makeGroup(curve, lip);
  },
});

//-------------------------------

Anitype.register("H", {
  // Enter your name
  author: "chanamonster",

  // Enter a personal website, must have http
  website: "http://chanamon.com/",

  // Make your animation here
  construct: function (two, points) {
    // Reference to instance
    var anitype = this;

    // Create a Two.Polygon
    var polygon = anitype.makePolygon(points);
    // Set an initial state
    // polygon.scale = 0;

    // Create the animation via a tween

    // for (var i = 0; i < = 5; i++){
    //   var x1 = polygon.vertices[1].x;
    //   var y1 = polygon.vertices[1].y;
    //   x1 += 100;
    //   y1 += 10;
    //   // polygon.vertices[1].x = x1;
    //   // polygon.vertices[1].y = y1;
    //   anitype.addTween(polygon.vertices[1], {
    //     to: { x: Math.sin(i)*300 +200 }, // rotate 360deg
    //   // easing: Anitype.Easing.Circular,
    //     duration: 0.1, // Value from 0 - 1
    //     start: 0        // Value from 0 - 1
    //   });
    // }

    //variables created with help from Greg Kepler's T
    var pt0 = points[0].clone();
    var pt1 = points[1].clone();
    var pt2 = points[2].clone();
    var pt3 = points[3].clone();
    var pt4 = points[4].clone();
    var pt5 = points[5].clone();
    var d = polygon.vertices[4].x * -1; //x distance from vertical center to edge of H

    //move to rotate around center of line
    pt0.x += d;
    pt1.x += d;
    pt2.x -= d;
    pt3.x -= d;

    var left = anitype.makePolygon([pt0, pt1]);
    var right = anitype.makePolygon([pt2, pt3]);
    var center = anitype.makePolygon([pt4, pt5]);

    anitype.addTween(left, {
      to: { rotation: 2 * Math.PI }, //rotate 360deg cw
      easing: Anitype.Easing.Sinusoidal.Out,
      duration: 0.9,
      start: 0,
    });

    left.translation.set(-d, 0);

    anitype.addTween(right, {
      to: { rotation: 2 * Math.PI }, //rotate 360deg cw
      easing: Anitype.Easing.Sinusoidal.Out,
      duration: 0.9,
      start: 0,
    });

    right.translation.set(d, 0);

    // Return your polygon wrapped in a group.
    return two.makeGroup(left, center, right);
  },
});

//-------------------------------

/**
 * Register your submission and choose a character
 * For more information check out the documentation
 * http://anitype.com/documentation
 */
Anitype.register("I", {
  // Enter your name
  author: "Collin Burger",
  // Enter a personal website, must have http
  website: "http://github.com/cyburgee",

  // Make your animation here
  construct: function (two, points) {
    // Reference to instance
    var anitype = this;

    var left = _.map(points, function (p) {
      return p.clone();
    });
    for (var i = 0; i < left.length; i++) {
      left[i].x = -1;
    }
    var right = _.map(points, function (p) {
      return p.clone();
    });
    for (var k = 0; k < right.length; k++) {
      right[k].x = 1;
    }

    right.reverse();
    var all = left.concat(right);
    right.reverse();

    anitype.addTick(function (t) {
      for (var i = 0; i < all.length; i++) {
        if (all[i].x < 0) all[i].x = -470 * Math.sin(t * Math.PI) + 1;
        else all[i].x = 470 * Math.sin(t * Math.PI) - 1;

        if (all[i].y < 0) all[i].y = -337 - 130 * Math.sin(t * Math.PI);
        else all[i].y = 337 + 130 * Math.sin(t * Math.PI);
      }

      polygon.fill = polygon.stroke;
    }, Anitype.Easing.Cubic.Out);
    //Back, Bounce, Circular, Cubic, Elastic, Exponential, Linear, Quadratic, Quartic, Quintic, and Sinusoidal.

    var polygon = new Two.Polygon(all, true);

    var ret = two.makeGroup(polygon);

    // Return your polygon wrapped in a group.
    return ret;
  },
});

//-------------------------------

Anitype.register("I", {
  author: "Max Hawkins",
  website: "http://maxhawkins.me/",

  construct: function (two, glyph) {
    var anitype = this;

    var points = anitype.makePolygon(glyph).subdivide().vertices;
    points = _.rest(points);

    var left = _.map(points, function (p) {
      return p.clone();
    });
    var right = _.map(points, function (p) {
      return p.clone();
    });

    right.reverse();
    var all = left.concat(right);
    right.reverse();

    function sinOffset(time, max, min, point, i) {
      var offset = i / points.length + time;
      var osc = Math.sin(offset * Math.PI * 2) / 2 + 0.5;
      point.x = osc * (max - min) + min;
    }

    anitype.addTick(function (t) {
      var leftOffset = _.partial(sinOffset, t, -30, -50);
      _.each(left, leftOffset);

      var rightOffset = _.partial(sinOffset, t, 30, 50);
      _.each(right, rightOffset);

      polygon.fill = polygon.stroke;
    });

    var polygon = new Two.Polygon(all, true);

    return two.makeGroup(polygon);
  },
});

//----------------------------

/**
 * Register your submission and choose a character
 * For more information check out the documentation
 * http://anitype.com/documentation
 */
Anitype.register("K", {
  // Enter your name
  author: "MLE",

  // Enter a personal website, must have http
  website: "http://emilydanchik.com",

  // Make your animation here
  construct: function (two, points) {
    // Reference to instance
    var anitype = this;

    // Change duration of animation
    this.duration = 1000;

    // Create a Two.Polygon
    var polygon = anitype.makePolygon(points);

    anitype.addTween(polygon.vertices[3], {
      to: { y: 0 },
      easing: Anitype.Easing.Quadratic.InOut,
      duration: 0.25, // Value from 0 - 1
      start: 0, // Value from 0 - 1
      complete: function () {
        anitype.addTween(polygon.vertices[3], {
          to: { x: -69, y: 40 },
          easing: Anitype.Easing.Quadratic.InOut,
          duration: 0.25, // Value from 0 - 1
          start: 0.26,
          complete: function () {
            anitype.addTween(polygon.vertices[3], {
              to: { x: -188, y: 0 },
              easing: Anitype.Easing.Quadratic.InOut,
              duration: 0.25, // Value from 0 - 1
              start: 0.51,
              complete: function () {
                anitype.addTween(polygon.vertices[3], {
                  to: { x: -188, y: 100 },
                  easing: Anitype.Easing.Quadratic.InOut,
                  duration: 0.24, // Value from 0 - 1
                  start: 0.76,
                });
              },
            });
          },
        });
      },
    });

    anitype.addTween(polygon.vertices[4], {
      to: { x: -188, y: 0 },
      easing: Anitype.Easing.Quadratic.InOut,
      duration: 0.25, // Value from 0 - 1
      start: 0, // Value from 0 - 1
      complete: function () {
        anitype.addTween(polygon.vertices[4], {
          to: { x: -188, y: -100 },
          easing: Anitype.Easing.Quadratic.InOut,
          duration: 0.25, // Value from 0 - 1
          start: 0.26,
          complete: function () {
            anitype.addTween(polygon.vertices[4], {
              to: { x: -188, y: 0 },
              easing: Anitype.Easing.Quadratic.InOut,
              duration: 0.25, // Value from 0 - 1
              start: 0.51,
              complete: function () {
                anitype.addTween(polygon.vertices[4], {
                  to: { x: -69, y: -40 },
                  easing: Anitype.Easing.Quadratic.InOut,
                  duration: 0.24, // Value from 0 - 1
                  start: 0.76,
                });
              },
            });
          },
        });
      },
    });

    // Return your polygon wrapped in a group.
    return two.makeGroup(polygon);
  },
});

//-------------------

/**
 * Register your submission and choose a character
 * For more information check out the documentation
 * http://anitype.com/documentation
 * "0" that explodes into a mountain.
 * "O What a Mountain!"
 */
Anitype.register("O", {
  // Enter your name
  author: "kdloney",
  // Make your animation here
  construct: function (two, points) {
    // Reference to instance
    var anitype = this;

    // Create a Two.Polygon
    var polygon = anitype.makePolygon(points);

    var p0 = polygon.vertices[0];
    var p1 = polygon.vertices[1];
    var p2 = polygon.vertices[2];
    var p3 = polygon.vertices[3];
    var p4 = polygon.vertices[4];

    // Set an initial state
    polygon.scale = 0;

    // Create the animation via a tween
    anitype.addTween(polygon, {
      to: { scale: 1.5 },
      easing: Anitype.Easing.Elastic.Out,
      duration: 3, // Value from 0 - 1
      start: 0.1, // Value from 0 - 1
    });

    anitype.addTween(polygon.vertices[0], {
      to: { y: -400, x: -500 },
      easing: Anitype.Easing.Quadratic.Out,
      duration: 0.2, // Value from 0 - 1
      start: 0.2, // Value from 0 - 1
      complete: function () {
        anitype.addTween(polygon.vertices[0], {
          to: { x: -600, y: 250 },
          easing: Anitype.Easing.Quadratic.InOut,
          duration: 0.3, // Value from 0 - 1
          start: 0.25,
        });
      },
    });

    anitype.addTween(polygon.vertices[4], {
      to: { y: -400, x: 500 },
      easing: Anitype.Easing.Quadratic.Out,
      duration: 0.2, // Value from 0 - 1
      start: 0.2, // Value from 0 - 1
      complete: function () {
        anitype.addTween(polygon.vertices[4], {
          to: { x: 600, y: 250 },
          easing: Anitype.Easing.Quadratic.InOut,
          duration: 0.3, // Value from 0 - 1
          start: 0.25,
        });
      },
    });
    anitype.addTween(polygon.vertices[2], {
      to: { y: 0, x: 0 },
      easing: Anitype.Easing.Quadratic.Out,
      duration: 0.3, // Value from 0 - 1
      start: 0.35, // Value from 0 - 1
      complete: function () {
        anitype.addTween(polygon.vertices[2], {
          to: { x: 0, y: -500 },
          easing: Anitype.Easing.Quadratic.InOut,
          duration: 0.4, // Value from 0 - 1
          start: 0.5,
        });
      },
    });
    // Return your polygon wrapped in a group.
    return two.makeGroup(polygon);
  },
});

//--------------------------------------

/**
 * Register your submission and choose a character
 * For more information check out the documentation
 * http://anitype.com/documentation
 *
 * I was inspired by the "M" by Quasimondo.
 * In this animation, I wanted the "L" to look like a mouth chomping down,
 * and then closing whole out of satifaction.
 */
Anitype.register("L", {
  // Enter your name
  author: "KLoney",

  // Make your animation here
  construct: function (two, points) {
    // Reference to instance
    var anitype = this;

    // Create a Two.Polygon
    var polygon = anitype.makePolygon(points);

    // Define vertices
    //var p0 = polygon.vertices[0];
    //var p1 = polygon.vertices[1];
    //var p2 = polygon.vertices[2];

    var px1 = polygon.vertices[0].x + 760;
    var py1 = polygon.vertices[0].y;
    var px2 = polygon.vertices[1].x + 50;
    var py2 = polygon.vertices[1].y;
    var px3 = px1 - px2;
    var py3 = py1 - py2;

    // Set an initial state
    polygon.scale = 1;
    polygon.translate = { x: 1000 };

    // Create the animation via a tween

    anitype.addTween(polygon.vertices[0], {
      to: { y: 0, x: px1 - 0 },
      easing: Anitype.Easing.Sinusoidal.Out,
      duration: 0.23, // Value from 0 - 1
      start: 0.1, // Value from 0 - 1
      complete: function () {
        anitype.addTween(polygon.vertices[0], {
          to: { y: py1, x: px1 },
          easing: Anitype.Easing.Sinusoidal.InOut,
          duration: 0.2, // Value from 0 - 1
          start: 0.3, // Value from 0 - 1
        });
      },
    });

    anitype.addTween(polygon.vertices[2], {
      to: { y: py2 + 0, x: px2 + 550 },
      easing: Anitype.Easing.Sinusoidal.Out,
      duration: 0.23, // Value from 0 - 1
      start: 0.1, // Value from 0 - 1
      complete: function () {
        anitype.addTween(polygon.vertices[0], {
          to: { y: py2, x: px2 + 500 },
          easing: Anitype.Easing.Sinusoidal.InOut,
          duration: 0.2, // Value from 0 - 1
          start: 0.25, // Value from 0 - 1
        });
      },
    });

    anitype.addTween(polygon.vertices[1], {
      to: { y: py2 + 0, x: px2 - 350 },
      easing: Anitype.Easing.Sinusoidal.Out,
      duration: 0.23, // Value from 0 - 1
      start: 0.54, // Value from 0 - 1
      complete: function () {
        anitype.addTween(polygon.vertices[0], {
          to: { y: py2, x: px2 - 350 },
          easing: Anitype.Easing.Sinusoidal.InOut,
          duration: 0.2, // Value from 0 - 1
          start: 0.45, // Value from 0 - 1
        });
      },
    });

    // Return your polygon wrapped in a group.
    return two.makeGroup(polygon);
  },
});

//--------------------------------------

/**
 * Register your submission and choose a character
 * For more information check out the documentation
 * http://anitype.com/documentation
 */
Anitype.register("P", {
  // Enter your name
  author: "Kevyn Mc",

  // Enter a personal website, must have http
  website: "http://digital-love.squarespace.com/",

  // Make your animation here
  construct: function (two, points) {
    // Reference to instance
    var anitype = this;

    // Create a Two.Polygon
    var polygon_A = anitype.makePolygon(points);
    // Set an initial state

    //Create pulsating rotation
    anitype.addTween(polygon_A, {
      to: { scale: 2, rotation: 2 * Math.PI },
      easing: Anitype.Easing.Exponential.Out,
      update: function () {
        anitype.addTween(polygon_A, {
          to: { scale: 0, rotation: -2 * Math.PI },
          easing: Anitype.Easing.Exponential.In,
          duration: 0.3,
          start: 0.7,
        });
      },
      duration: 0.6,
      start: 0,
    });
    // Return your polygon wrapped in a group.
    return two.makeGroup(polygon_A);
  },
});

//-------------------------------------------

/**
 * Register your submission and choose a character
 * For more information check out the documentation
 * http://anitype.com/documentation
 */
Anitype.register("A", {
  // Enter your name
  author: "Kevyn Mc",

  // Enter a personal website, must have http
  website: "http://digital-love.squarespace.com/",

  // Make your animation here
  construct: function (two, points) {
    // Reference to instance
    var anitype = this;

    // Create a Two.Polygon
    var polygon = anitype.makePolygon(points);
    // Set an initial state
    polygon.vertices[0].set(-215, 329);
    polygon.vertices[1].set(0, -329);
    polygon.vertices[2].set(215, 329);
    polygon.vertices[3].set(-160, 158);
    polygon.vertices[4].set(160, 158);

    // Create the animation via a tween
    function moveVert(vert, x1, x2, y1, y2) {
      anitype.addTween(vert, {
        to: { x: x1, y: y1 },
        easing: Anitype.Easing.Elastic.Out,
        update: function () {
          anitype.addTween(vert, {
            to: { x: x2, y: y2 },
            easing: Anitype.Easing.Elastic.Out,
            duration: 1,
            start: 0,
          });
        },
        duration: 1, // Value from 0 - 1
        start: 0, // Value from 0 - 1
      });
    }

    moveVert(polygon.vertices[0], -700, -215, 389, 329);
    moveVert(polygon.vertices[1], 0, -0, 230, -329);
    moveVert(polygon.vertices[2], 700, 215, 389, 329);
    moveVert(polygon.vertices[3], -900, -160, 188, 158);
    moveVert(polygon.vertices[4], 900, 160, 188, 158);

    // Return your polygon wrapped in a group.
    return two.makeGroup(polygon);
  },
});

//-----------------------------------

/**
 * Register your submission and choose a character
 * For more information check out the documentation
 * http://anitype.com/documentation
 */
Anitype.register("G", {
  // Enter your name
  author: "MacKenzie Bates",

  // Enter a personal website, must have http
  website: "http://itbmac.com",

  // Make your animation here
  construct: function (two, points) {
    // Reference to instance
    var anitype = this;

    // Create a Two.Polygon
    var polygon = anitype.makePolygon(points);

    var tTopY = points[0].y;
    var pt1 = points[0].clone();
    var pt2 = points[1].clone();
    var pt3 = points[2].clone();
    var pt4 = points[3].clone();
    var pt5 = points[4].clone();
    var pt5b = points[4].clone();
    var pt6b = points[5].clone();
    var pt7b = points[5].clone();
    pt5b.y = pt6b.y = pt7b.y = 0;
    pt7b.x = pt5b.x;

    var pts2 = [pt7b, pt6b];
    var poly1 = anitype.makePolygon([pt1, pt2, pt3, pt4, pt5]);
    poly1.translation.set(0, tTopY + 200);
    var poly2 = anitype.makePolygon(pts2);

    anitype.addTween(poly1.translation, {
      to: { y: tTopY + 275 },
      easing: Anitype.Easing.Sinusoidal.Out,
      duration: 0.1,
      start: 0.1,
      complete: function () {
        anitype.addTween(poly1.translation, {
          to: { y: tTopY + 100 },
          easing: Anitype.Easing.Elastic.Out,
          duration: 0.3,
          start: 0.2,
          complete: function () {
            anitype.addTween(poly1.translation, {
              to: { y: tTopY + 190 },
              easing: Anitype.Easing.Sinusoidal.InOut,
              duration: 0.3,
              start: 0.5,
            });
          },
        });
      },
    });

    anitype.addTween(poly1, {
      to: { rotation: Math.PI * 2 },
      easing: Anitype.Easing.Sinusoidal.Out,
      duration: 0.5,
      start: 0.2,
    });

    anitype.addTween(pts2[0], {
      to: { y: tTopY + 125 },
      easing: Anitype.Easing.Sinusoidal.Out,
      duration: 0.05,
      start: 0.0,
      complete: function () {
        anitype.addTween(pts2[0], {
          to: { y: tTopY + 200 },
          easing: Anitype.Easing.Elastic.Out,
          duration: 0.05,
          start: 0.05,
        });
      },
    });

    // Return your polygon wrapped in a group.
    return two.makeGroup(poly1, poly2);
  },
});

//--------------------------------

/**
 * Register your submission and choose a character
 * For more information check out the documentation
 * http://anitype.com/documentation
 */
Anitype.register("Q", {
  // Enter your name
  author: "MacKenzie Bates",

  // Enter a personal website, must have http
  website: "http://itbmac.com/",

  // Make your animation here
  construct: function (two, points) {
    // Reference to instance
    var anitype = this;

    // Create a Two.Polygon
    var polygon = anitype.makePolygon(points);

    var topY = points[0].y - 340;
    var midY = points[0].y;
    var botY = points[1].y;

    var leftX = points[1].x;
    var middX = points[0].x;
    var rghtX = points[3].x;

    var pt0c = points[0].clone();
    var pt1c = points[1].clone();
    var pt2c = points[2].clone();
    var pt3c = points[3].clone();
    var pt4c = points[4].clone();
    var pt5c = points[5].clone();
    var pt6c = points[6].clone();

    var pt0rb = pt0c.controls.right;
    var pt0lb = pt0c.controls.left;
    var pt1rb = pt1c.controls.right;
    var pt1lb = pt1c.controls.left;
    var pt2rb = pt2c.controls.right;
    var pt2lb = pt2c.controls.left;
    var pt3rb = pt3c.controls.right;
    var pt3lb = pt3c.controls.left;
    var pt4rb = pt4c.controls.right;
    var pt4lb = pt4c.controls.left;

    pt0rb = pt0rb.toObject();
    pt0lb = pt0lb.toObject();
    pt1rb = pt1rb.toObject();
    pt1lb = pt1lb.toObject();
    pt2rb = pt2rb.toObject();
    pt2lb = pt2lb.toObject();
    pt3rb = pt3rb.toObject();
    pt3lb = pt3lb.toObject();
    pt4rb = pt4rb.toObject();
    pt4lb = pt4lb.toObject();

    pt0c.controls.right.copy(points[0]);
    pt0c.controls.left.copy(points[0]);
    pt1c.controls.right.copy(points[1]);
    pt1c.controls.left.copy(points[1]);
    pt2c.controls.right.copy(points[2]);
    pt2c.controls.left.copy(points[2]);
    pt3c.controls.right.copy(points[3]);
    pt3c.controls.left.copy(points[3]);
    pt4c.controls.right.copy(points[4]);
    pt4c.controls.left.copy(points[4]);

    var pt0 = points[0].clone();
    var pt1 = points[1].clone();
    var pt2 = points[2].clone();
    var pt3 = points[3].clone();
    var pt4 = points[4].clone();
    var pt5 = points[5].clone();
    var pt6 = points[6].clone();

    var pt0r = pt0.controls.right;
    var pt0l = pt0.controls.left;
    var pt1r = pt1.controls.right;
    var pt1l = pt1.controls.left;
    var pt2r = pt2.controls.right;
    var pt2l = pt2.controls.left;
    var pt3r = pt3.controls.right;
    var pt3l = pt3.controls.left;
    var pt4r = pt4.controls.right;
    var pt4l = pt4.controls.left;

    pt0r = pt0r.toObject();
    pt0l = pt0l.toObject();
    pt1r = pt1r.toObject();
    pt1l = pt1l.toObject();
    pt2r = pt2r.toObject();
    pt2l = pt2l.toObject();
    pt3r = pt3r.toObject();
    pt3l = pt3l.toObject();
    pt4r = pt4r.toObject();
    pt4l = pt4l.toObject();

    pt5.x = pt6.x = 0;

    var pts1 = [pt0, pt1, pt2, pt3, pt4];
    var pts2 = [pt5, pt6];
    var poly1 = anitype.makePolygon(pts1);
    var poly2 = anitype.makePolygon(pts2);

    anitype.addTween(poly2.translation, {
      to: { y: midY - 15 },
      easing: Anitype.Easing.Sinusoidal.In,
      duration: 0.3,
      start: 0.2,
      complete: function () {
        anitype.addTween(poly2.translation, {
          to: { y: botY },
          easing: Anitype.Easing.Sinusoidal.Out,
          duration: 0.3,
          start: 0.7,
        });
      },
    });

    anitype.addTween(pts1[0], {
      to: { y: botY },
      easing: Anitype.Easing.Sinusoidal.In,
      duration: 0.3,
      start: 0.2,
      complete: function () {
        anitype.addTween(pts1[0], {
          to: { y: midY },
          easing: Anitype.Easing.Sinusoidal.Out,
          duration: 0.3,
          start: 0.7,
        });
      },
    });

    anitype.addTween(pts1[1], {
      to: { y: botY, x: leftX + 270 },
      easing: Anitype.Easing.Sinusoidal.In,
      duration: 0.3,
      start: 0.2,
      complete: function () {
        anitype.addTween(pts1[1], {
          to: { y: botY, x: leftX },
          easing: Anitype.Easing.Sinusoidal.Out,
          duration: 0.3,
          start: 0.7,
        });
      },
    });

    anitype.addTween(pts1[2], {
      to: { y: botY },
      easing: Anitype.Easing.Sinusoidal.In,
      duration: 0.3,
      start: 0.2,
      complete: function () {
        anitype.addTween(pts1[2], {
          to: { y: botY + 350 },
          easing: Anitype.Easing.Sinusoidal.Out,
          duration: 0.3,
          start: 0.7,
        });
      },
    });

    anitype.addTween(pts1[3], {
      to: { y: botY, x: rghtX - 270 },
      easing: Anitype.Easing.Sinusoidal.In,
      duration: 0.3,
      start: 0.2,
      complete: function () {
        anitype.addTween(pts1[3], {
          to: { y: botY, x: rghtX },
          easing: Anitype.Easing.Sinusoidal.Out,
          duration: 0.3,
          start: 0.7,
        });
      },
    });

    anitype.addTween(pts1[4], {
      to: { y: botY },
      easing: Anitype.Easing.Sinusoidal.In,
      duration: 0.3,
      start: 0.2,
      complete: function () {
        anitype.addTween(pts1[4], {
          to: { y: midY },
          easing: Anitype.Easing.Sinusoidal.Out,
          duration: 0.3,
          start: 0.7,
        });
      },
    });

    anitype.addTween(pts1[0].controls.right, {
      to: { y: botY },
      easing: Anitype.Easing.Sinusoidal.In,
      duration: 0.3,
      start: 0.2,
      complete: function () {
        anitype.addTween(pts1[0].controls.right, {
          to: { y: pt0rb.y },
          easing: Anitype.Easing.Sinusoidal.In,
          duration: 0.3,
          start: 0.7,
        });
      },
    });

    anitype.addTween(pts1[0].controls.left, {
      to: { y: botY },
      easing: Anitype.Easing.Sinusoidal.In,
      duration: 0.3,
      start: 0.2,
      complete: function () {
        anitype.addTween(pts1[0].controls.left, {
          to: { y: pt0lb.y },
          easing: Anitype.Easing.Sinusoidal.In,
          duration: 0.3,
          start: 0.7,
        });
      },
    });

    anitype.addTween(pts1[1].controls.right, {
      to: { y: botY },
      easing: Anitype.Easing.Sinusoidal.In,
      duration: 0.3,
      start: 0.2,
      complete: function () {
        anitype.addTween(pts1[1].controls.right, {
          to: { y: pt1rb.y },
          easing: Anitype.Easing.Sinusoidal.In,
          duration: 0.3,
          start: 0.7,
        });
      },
    });

    anitype.addTween(pts1[1].controls.left, {
      to: { y: botY },
      easing: Anitype.Easing.Sinusoidal.In,
      duration: 0.3,
      start: 0.2,
      complete: function () {
        anitype.addTween(pts1[1].controls.left, {
          to: { y: pt1lb.y },
          easing: Anitype.Easing.Sinusoidal.In,
          duration: 0.3,
          start: 0.7,
        });
      },
    });

    anitype.addTween(pts1[2].controls.right, {
      to: { y: botY },
      easing: Anitype.Easing.Sinusoidal.In,
      duration: 0.3,
      start: 0.2,
      complete: function () {
        anitype.addTween(pts1[2].controls.right, {
          to: { y: pt2rb.y },
          easing: Anitype.Easing.Sinusoidal.In,
          duration: 0.3,
          start: 0.7,
        });
      },
    });

    anitype.addTween(pts1[2].controls.left, {
      to: { y: botY },
      easing: Anitype.Easing.Sinusoidal.In,
      duration: 0.3,
      start: 0.2,
      complete: function () {
        anitype.addTween(pts1[2].controls.left, {
          to: { y: pt2lb.y },
          easing: Anitype.Easing.Sinusoidal.In,
          duration: 0.3,
          start: 0.7,
        });
      },
    });

    anitype.addTween(pts1[3].controls.right, {
      to: { y: botY },
      easing: Anitype.Easing.Sinusoidal.In,
      duration: 0.3,
      start: 0.2,
      complete: function () {
        anitype.addTween(pts1[3].controls.right, {
          to: { y: pt3rb.y },
          easing: Anitype.Easing.Sinusoidal.In,
          duration: 0.3,
          start: 0.7,
        });
      },
    });

    anitype.addTween(pts1[3].controls.left, {
      to: { y: botY },
      easing: Anitype.Easing.Sinusoidal.In,
      duration: 0.3,
      start: 0.2,
      complete: function () {
        anitype.addTween(pts1[3].controls.left, {
          to: pt3lb,
          easing: Anitype.Easing.Sinusoidal.In,
          duration: 0.3,
          start: 0.7,
        });
      },
    });

    anitype.addTween(pts1[4].controls.right, {
      to: { y: botY },
      easing: Anitype.Easing.Sinusoidal.In,
      duration: 0.3,
      start: 0.2,
      complete: function () {
        anitype.addTween(pts1[4].controls.right, {
          to: { y: pt4rb.y },
          easing: Anitype.Easing.Sinusoidal.In,
          duration: 0.3,
          start: 0.7,
        });
      },
    });

    anitype.addTween(pts1[4].controls.left, {
      to: { y: botY },
      easing: Anitype.Easing.Sinusoidal.In,
      duration: 0.3,
      start: 0.2,
      complete: function () {
        anitype.addTween(pts1[4].controls.left, {
          to: { y: pt4lb.y },
          easing: Anitype.Easing.Sinusoidal.In,
          duration: 0.3,
          start: 0.7,
        });
      },
    });

    // Return your polygon wrapped in a group.
    return two.makeGroup(poly1, poly2);
  },
});

//----------------------

/**
 * Register your submission and choose a character
 * For more information check out the documentation
 * http://anitype.com/documentation
 */
Anitype.register("Q", {
  // Enter your name
  author: "MacKenzie Bates",

  // Enter a personal website, must have http
  website: "http://itbmac.com/",

  // Make your animation here
  construct: function (two, points) {
    // Reference to instance
    var anitype = this;

    // Create a Two.Polygon
    var polygon = anitype.makePolygon(points);

    var topY = points[0].y - 340;
    var midY = points[0].y;
    var botY = points[1].y;

    var pt1 = points[0].clone();
    var pt2 = points[1].clone();
    var pt3 = points[2].clone();
    var pt4 = points[3].clone();
    var pt5 = points[4].clone();
    var pt5b = points[5].clone();
    var pt6b = points[6].clone();

    pt5b.x = pt6b.x = 0;

    var pts1 = [pt1, pt2, pt3, pt4, pt5];
    var pts2 = [pt5b, pt6b];
    var poly1 = anitype.makePolygon(pts1);
    var poly2 = anitype.makePolygon(pts2);

    anitype.addTween(poly2.translation, {
      to: { y: midY - 15 },
      easing: Anitype.Easing.Sinusoidal.In,
      duration: 0.2,
      start: 0.15,
      complete: function () {
        anitype.addTween(poly2.translation, {
          to: { y: botY },
          easing: Anitype.Easing.Sinusoidal.Out,
          duration: 0.2,
          start: 0.8,
        });
      },
    });

    anitype.addTween(pts1[0], {
      to: { y: botY },
      easing: Anitype.Easing.Sinusoidal.In,
      duration: 0.2,
      start: 0.15,
      complete: function () {
        anitype.addTween(pts1[0], {
          to: { y: midY },
          easing: Anitype.Easing.Sinusoidal.Out,
          duration: 0.2,
          start: 0.8,
        });
      },
    });

    anitype.addTween(pts1[1], {
      to: { y: botY },
      easing: Anitype.Easing.Sinusoidal.In,
      duration: 0.2,
      start: 0.15,
      complete: function () {
        anitype.addTween(pts1[1], {
          to: { y: botY },
          easing: Anitype.Easing.Sinusoidal.Out,
          duration: 0.2,
          start: 0.8,
        });
      },
    });

    anitype.addTween(pts1[2], {
      to: { y: botY },
      easing: Anitype.Easing.Sinusoidal.In,
      duration: 0.2,
      start: 0.15,
      complete: function () {
        anitype.addTween(pts1[2], {
          to: { y: botY + 350 },
          easing: Anitype.Easing.Sinusoidal.Out,
          duration: 0.2,
          start: 0.8,
        });
      },
    });

    anitype.addTween(pts1[3], {
      to: { y: botY },
      easing: Anitype.Easing.Sinusoidal.In,
      duration: 0.2,
      start: 0.15,
      complete: function () {
        anitype.addTween(pts1[3], {
          to: { y: botY },
          easing: Anitype.Easing.Sinusoidal.Out,
          duration: 0.2,
          start: 0.8,
        });
      },
    });

    anitype.addTween(pts1[4], {
      to: { y: botY },
      easing: Anitype.Easing.Sinusoidal.In,
      duration: 0.2,
      start: 0.15,
      complete: function () {
        anitype.addTween(pts1[4], {
          to: { y: midY },
          easing: Anitype.Easing.Sinusoidal.Out,
          duration: 0.2,
          start: 0.8,
        });
      },
    });
    // Return your polygon wrapped in a group.
    return two.makeGroup(poly1, poly2);
  },
});

//-------------------------------------

Anitype.register("L", {
  // Enter your name
  author: "Haris Usmani",

  //Title: Strike the Hockey Stick
  //Technique: Simple Vertice Tween

  // Enter a personal website, must have http
  website: "http://harisusmani.com/",

  // Make your animation here
  construct: function (two, points) {
    // Reference to instance
    var anitype = this;

    // Create a Two.Polygon
    var polygon = anitype.makePolygon(points);
    // Set an initial state
    polygon.scale = 1;

    var iniX_v1 = polygon.vertices[1].x;
    var iniY_v1 = polygon.vertices[1].y;
    var iniX_v2 = polygon.vertices[2].x;
    var iniY_v2 = polygon.vertices[2].y;

    // Create the animation via a tween
    anitype.addTween(polygon.vertices[1], {
      to: { y: iniY_v1 - 300, x: iniX_v1 - 150 }, //Take Aim
      easing: Anitype.Easing.Elastic.Out,
      duration: 0.2, // Val ue from 0 - 1
      start: 0.0, // Value from 0 - 1
      complete: function () {
        anitype.addTween(polygon.vertices[1], {
          to: { y: iniY_v1 - 50, x: iniX_v1 }, //Hit 1
          easing: Anitype.Easing.Quadratic.In,
          duration: 0.3, // Val ue from 0 - 1
          start: 0.25, // Value from 0 - 1
          complete: function () {
            anitype.addTween(polygon.vertices[1], {
              to: { y: iniY_v1 - 150, x: iniX_v1 + 100 }, //Hit 2
              easing: Anitype.Easing.Elastic.In,
              duration: 0.2, // Val ue from 0 - 1
              start: 0.35, // Value from 0 - 1
              complete: function () {
                anitype.addTween(polygon.vertices[1], {
                  to: { y: iniY_v1, x: iniX_v1 }, //Return
                  easing: Anitype.Easing.Quadratic.Out,
                  duration: 0.1, // Val ue from 0 - 1
                  start: 0.9, // Value from 0 - 1
                });
              },
            });
          },
        });
      },
    });

    anitype.addTween(polygon.vertices[2], {
      to: { y: iniY_v2 - 250, x: iniX_v2 + 10 }, //Take Aim
      easing: Anitype.Easing.Elastic.Out,
      duration: 0.2, // Val ue from 0 - 1
      start: 0.0, // Value from 0 - 1
      complete: function () {
        anitype.addTween(polygon.vertices[2], {
          to: { y: iniY_v2 - 50, x: iniX_v2 }, //Hit 1
          easing: Anitype.Easing.Quadratic.In,
          duration: 0.3, // Val ue from 0 - 1
          start: 0.25, // Value from 0 - 1
          complete: function () {
            anitype.addTween(polygon.vertices[2], {
              to: { y: iniY_v2 - 120, x: iniX_v2 - 10 }, //Hit 2
              easing: Anitype.Easing.Elastic.In,
              duration: 0.2, // Val ue from 0 - 1
              start: 0.35, // Value from 0 - 1
              complete: function () {
                anitype.addTween(polygon.vertices[2], {
                  to: { y: iniY_v2, x: iniX_v2 }, //Return
                  easing: Anitype.Easing.Quadratic.Out,
                  duration: 0.1, // Val ue from 0 - 1
                  start: 0.9, // Value from 0 - 1
                });
              },
            });
          },
        });
      },
    });

    // Return your polygon wrapped in a group.
    return two.makeGroup(polygon);
  },
});

//---------------------------

Anitype.register("Z", {
  // Enter your name
  author: "Haris Usmani",

  // Enter a personal website, must have http
  website: "http://harisusmani.com/",

  //Title: Is it a Z or a L?

  // Make your animation here
  construct: function (two, points) {
    // Reference to instance
    var anitype = this;

    // Create a Two.Polygon
    var polygon = anitype.makePolygon(points);
    // Set an initial state
    polygon.scale = 1;

    var iniX_v0 = polygon.vertices[0].x;
    var iniY_v0 = polygon.vertices[0].y;
    var iniX_v1 = polygon.vertices[1].x;
    var iniY_v1 = polygon.vertices[1].y;
    var iniX_v2 = polygon.vertices[2].x;
    var iniY_v2 = polygon.vertices[2].y;
    var iniX_v3 = polygon.vertices[3].x;
    var iniY_v3 = polygon.vertices[3].y;

    // Create the animation via a tween
    anitype.addTween(polygon.vertices[1], {
      to: { x: iniX_v0 }, //Take Aim
      easing: Anitype.Easing.Elastic.Out,
      duration: 0.3, // Val ue from 0 - 1
      start: 0.2, // Value from 0 - 1
      complete: function () {
        anitype.addTween(polygon.vertices[2], {
          to: { x: iniX_v2 }, //Hit 1
          easing: Anitype.Easing.Quadratic.In,
          duration: 0.2, // Val ue from 0 - 1
          start: 0.4, // Value from 0 - 1
          complete: function () {
            anitype.addTween(polygon.vertices[1], {
              to: { y: iniY_v1 - 150, x: iniX_v1 + 100 }, //Hit 2
              easing: Anitype.Easing.Elastic.In,
              duration: 0.2, // Val ue from 0 - 1
              start: 0.6, // Value from 0 - 1
              complete: function () {
                anitype.addTween(polygon.vertices[1], {
                  to: { y: iniY_v1, x: iniX_v1 }, //Return
                  easing: Anitype.Easing.Quadratic.Out,
                  duration: 0.5, // Val ue from 0 - 1
                  start: 0.5, // Value from 0 - 1
                });
              },
            });
          },
        });
      },
    });

    anitype.addTween(polygon.vertices[2], {
      to: { x: iniX_v2 + 10 }, //Take Aim
      easing: Anitype.Easing.Elastic.Out,
      duration: 0.2, // Val ue from 0 - 1
      start: 0.4, // Value from 0 - 1
      complete: function () {
        anitype.addTween(polygon.vertices[2], {
          to: { y: iniY_v2 - 50, x: iniX_v2 }, //Hit 1
          easing: Anitype.Easing.Quadratic.In,
          duration: 0.3, // Val ue from 0 - 1
          start: 0.25, // Value from 0 - 1
          complete: function () {
            anitype.addTween(polygon.vertices[2], {
              to: { y: iniY_v2 - 120, x: iniX_v2 - 10 }, //Hit 2
              easing: Anitype.Easing.Elastic.In,
              duration: 0.2, // Val ue from 0 - 1
              start: 0.35, // Value from 0 - 1
              complete: function () {
                anitype.addTween(polygon.vertices[2], {
                  to: { y: iniY_v2, x: iniX_v2 }, //Return
                  easing: Anitype.Easing.Quadratic.Out,
                  duration: 0.1, // Val ue from 0 - 1
                  start: 0.9, // Value from 0 - 1
                });
              },
            });
          },
        });
      },
    });

    // Create the animation via a tween
    anitype.addTween(polygon, {
      to: { scale: 1 },
      easing: Anitype.Easing.Elastic.Out,
      duration: 0.33, // Value from 0 - 1
      start: 0, // Value from 0 - 1
    });

    // Return your polygon wrapped in a group.
    return two.makeGroup(polygon);
  },
});

//-----------------------------------------------------

/**
 * Register your submission and choose a character
 * For more information check out the documentation
 * http://anitype.com/documentation
 */
Anitype.register("S", {
  // Enter your name
  author: "vermilly",

  // Enter a kickback website, must have http
  website: "http://twitter.com/vermilly",

  // Make your animation here
  construct: function (two, points) {
    // Reference to instance
    var anitype = this;

    // Create a Two.Polygon
    var polygon = anitype.makePolygon(points);

    _.each(polygon.vertices, function (vert, i) {
      vert.oY = vert.y;
      vert.oX = vert.x;
      var time = { value: 0 };
      anitype.addTween(time, {
        to: { value: 1 },
        easing: Anitype.Easing.Sinusoidal.InOut,
        duration: 0.2,
        start: 0,
        update: function () {
          vert.x = 1;
          vert.y = 0.1 * vert.oY;
        },
      });

      anitype.addTween(time, {
        to: { value: 1 },
        easing: Anitype.Easing.Sinusoidal.InOut,
        duration: 0.2,
        start: 0.2,
        update: function () {
          vert.x = 1;
          vert.y = 0.2 * vert.oY;
        },
      });

      anitype.addTween(time, {
        to: { value: 1 },
        easing: Anitype.Easing.Sinusoidal.InOut,
        duration: 0.2,
        start: 0.4,
        update: function () {
          vert.x = 1;
          vert.y = 0.4 * vert.oY;
        },
      });

      anitype.addTween(time, {
        to: { value: 1 },
        easing: Anitype.Easing.Sinusoidal.InOut,
        duration: 0.2,
        start: 0.6,
        update: function () {
          vert.x = 1;
          vert.y = 0.8 * vert.oY;
        },
      });

      anitype.addTween(time, {
        to: { value: 1 },
        easing: Anitype.Easing.Sinusoidal.InOut,
        duration: 0.2,
        start: 0.8,
        update: function () {
          vert.y = 1 * vert.oY;
          vert.x = vert.oX;
        },
      });
    });

    // Return your polygon wrapped in a group.
    return two.makeGroup(polygon);
  },
});

//-----------------------------------------------------

/**
 * Register your submission and choose a character
 * For more information check out the documentation
 * http://anitype.com/documentation
 */
Anitype.register("X", {
  // Enter your name
  author: "vermilly",

  // Enter a personal website, must have http
  website: "http://twitter.com/vermilly",

  // Make your animation here
  construct: function (two, points) {
    // Reference to instance
    var anitype = this;

    // Create a Two.Polygon
    var polygon = anitype.makePolygon(points);

    // Set an initial state
    //polygon.scale = 0.5;
    polygon.vertices[0].set(-200, -350); // left top -186, -337
    polygon.vertices[1].set(0, 350); // left bottom 186, 337
    polygon.vertices[2].set(0, 350); //right top 186, -337
    polygon.vertices[3].set(200, -350); // right bottom -186, 337

    anitype.addTween(polygon.vertices[3], {
      to: { x: 0, y: -400 },
      easing: Anitype.Easing.Elastic.Out,
      duration: 0.1,
      start: 0.0,
    });
    anitype.addTween(polygon.vertices[0], {
      to: { x: -350, y: -250 },
      easing: Anitype.Easing.Elastic.Out,
      duration: 0.1,
      start: 0.0,
      complete: function () {
        anitype.addTween(polygon.vertices[0], {
          to: { x: -300, y: -300 },
          easing: Anitype.Easing.Elastic.Out,
          duration: 0.2,
          start: 0.1,
          complete: function () {
            anitype.addTween(polygon.vertices[0], {
              to: { x: -200, y: -350 },
              easing: Anitype.Easing.Elastic.Out,
              duration: 0.2,
              start: 0.3,
              complete: function () {
                anitype.addTween(polygon.vertices[0], {
                  to: { x: 0, y: -400 },
                  easing: Anitype.Easing.Elastic.Out,
                  duration: 0.2,
                  start: 0.5,
                  complete: function () {
                    anitype.addTween(polygon.vertices[0], {
                      to: { x: -200, y: -350 },
                      easing: Anitype.Easing.Elastic.Out,
                      duration: 0.1,
                      start: 0.7,
                    });
                    anitype.addTween(polygon.vertices[3], {
                      to: { x: 200, y: -350 },
                      easing: Anitype.Easing.Elastic.Out,
                      duration: 0.1,
                      start: 0.7,
                    });
                  },
                });
              },
            });
          },
        });
      },
    });

    // Return your polygon wrapped in a group.
    return two.makeGroup(polygon);
  },
});

//--------------------------------

Anitype.register("U", {
  author: "Sama Kanbour",
  website: "www.facebook.com/SamaKanbour",

  construct: function (two, points) {
    var anitype = this;
    var polygon = anitype.makePolygon(points);
    var step = 0.1 / 15;
    polygon.subdivide(15);
    var circles = _.map(polygon.vertices, function (v) {
      var circle = two.makeCircle(0, 0, 2);
      circle.translation.x = v.x;
      circle.translation.y = v.y;
      return circle;
    });
    _.each(circles, function (c, i) {
      c.scale = 0;
      anitype.addTween(c, {
        to: { scale: 3 },
        easing: Anitype.Easing.Elastic.Out,
        duration: 60 / 15,
        start: step * i,
      });
    });
    return two.makeGroup(circles);
  },
});

//------------------------

Anitype.register("O", {
  author: "Sama Kanbour",
  website: "www.facebook.com/SamaKanbour",

  construct: function (two, points) {
    var anitype = this;
    var vertices = anitype.makePolygon(points).subdivide(3).vertices;
    var circles = _.map(vertices, function (v, i) {
      var corona = makeTriangle(two, 30);
      corona.translation.set(v.x, v.y);
      corona.rotation = Math.atan2(-v.y, -v.x) + Math.PI / 2;
      return corona;
    });
    anitype.addTick(function (t) {
      _.each(circles, function (c, i) {
        c.rotation += (Math.PI * 2) / 60;
      });
    });
    return two.makeGroup(circles);
  },
});

function makeTriangle(two, size) {
  var tri = two.makePolygon(-size, 0, size, 0, 0, size);
  return tri;
}

//------------------------------

/**
 * Register your submission and choose a character
 * For more information check out the documentation
 * http://anitype.com/documentation
 */
Anitype.register("V", {
  // Enter your name
  author: "Shan Huang",

  // Enter a personal website, must have http
  website: "http://shan-huang.com/",

  // Make your animation here
  construct: function (two, points) {
    // Reference to instance
    var anitype = this;

    // Create a Two.Polygon
    var polygon = anitype.makePolygon(points);
    // Set an initial state
    var p0 = polygon.vertices[0].clone();
    var p2 = polygon.vertices[2].clone();
    polygon.vertices[0].set(0, -370);
    polygon.vertices[2].set(0, -370);

    // Create the animation via a tween
    anitype.addTween(polygon.vertices[0], {
      to: { x: p0.x, y: p0.y },
      easing: Anitype.Easing.Bounce.Out,
      duration: 0.9, // Value from 0 - 1
      start: 0, // Value from 0 - 1
    });

    anitype.addTween(polygon.vertices[2], {
      to: { x: p2.x, y: p2.y },
      easing: Anitype.Easing.Bounce.Out,
      duration: 0.6, // Value from 0 - 1
      start: 0, // Value from 0 - 1
    });

    // Return your polygon wrapped in a group.
    return two.makeGroup(polygon);
  },
});

//------------------------------

/**
 * Register your submission and choose a character
 * For more information check out the documentation
 * http://anitype.com/documentation
 */
Anitype.register("O", {
  // Enter your name
  author: "Shan Huang",

  // Enter a personal website, must have http
  website: "http://shan-huang.com/",

  // Make your animation here
  construct: function (two, points) {
    // Reference to instance
    var anitype = this;

    // Create a Two.Polygon
    var polygon = anitype.makePolygon(points).subdivide();
    // Set an initial state
    var circle = two.makeCircle(0, 0, 5);

    // Create the animation via a tween
    anitype.addTick(function (percent) {
      var perc = percent - Math.floor(percent);
      var idx =
        Math.floor(percent * polygon.vertices.length) % polygon.vertices.length;
      if (perc < 0.21125 || perc > 0.35) {
        circle.translation.y = polygon.vertices[idx].x / 2;
        circle.translation.x = polygon.vertices[idx].y;
      } else {
        circle.translation.y = -10000;
        circle.translation.x = -10000;
      }
    });

    // Return your polygon wrapped in a group.
    return two.makeGroup([polygon, circle]);
  },
});

//----------------------------

/**
 * Register your submission and choose a character
 * For more information check out the documentation
 * http://anitype.com/documentation
 */
Anitype.register("Q", {
  // Enter your name
  author: "sbarton272",

  // Enter a personal website, must have http
  website: "https://github.com/sbarton272",

  // Make your animation here
  construct: function (two, points) {
    // Reference to instance
    var anitype = this;

    // Create a Two.Polygon
    var linePoints = points.splice(5, 2);
    var ovalPoints = points;
    var oval = anitype.makePolygon(ovalPoints);
    var line = anitype.makePolygon(linePoints);

    var xOffset = -500;
    var littleHopHeight = 50;
    var bigHopHeight = 200;
    var littleHopTime = 0.3;
    var bigHopTime = 0.5;
    var nLittleHops = 1;
    var totHopTime = littleHopTime + bigHopTime;

    // rotate oval
    oval.rotation = -0.05;

    // store original y values
    _.each(line.vertices, function (v, t) {
      v.startY = v.y;
    });

    // hop line over
    anitype.addTick(function (percent) {
      _.each(line.vertices, function (v, t) {
        // x movement
        if (percent < totHopTime) {
          var xDistPercent = (totHopTime - percent) / totHopTime;
          v.x = xDistPercent * xOffset;
        }

        // y movement
        var hopTime;
        if (percent < littleHopTime) {
          // map percent [0,littleHopTime] -> [0,1]
          hopTime = percent / littleHopTime;
          v.y =
            v.startY -
            littleHopHeight *
              Math.abs(Math.sin(Math.PI * hopTime * nLittleHops));
        } else if (percent < totHopTime) {
          // map percent [littleHopTime, bigHopTim+littleHopTime] -> [0,1]
          hopTime = (percent - littleHopTime) / bigHopTime;
          v.y = v.startY - bigHopHeight * Math.sin(Math.PI * hopTime);
        }
      });
    });

    anitype.addTween(oval, {
      to: { rotation: 0 },
      easing: Anitype.Easing.easeOutSine,
      duration: totHopTime, // Value from 0 - 1
      start: 0, // Value from 0 - 1
    });

    // Return your polygon wrapped in a group.
    return two.makeGroup(oval, line);
  },
});

//-----------------------------

/**
 * Register your submission and choose a character
 * For more information check out the documentation
 * http://anitype.com/documentation
 */
Anitype.register("W", {
  // Enter your name
  author: "sbarton272",

  // Enter a personal website, must have http
  website: "https://github.com/sbarton272",

  // Make your animation here
  construct: function (two, points) {
    // Reference to instance
    var anitype = this;

    // Create a Two.Polygon
    var polygon = anitype.makePolygon(points);

    // Set an initial state
    polygon.scale = 1;

    // Useful vars
    var easing = Anitype.Easing.Elastic.Out;
    var startX = 0;

    // start all points at zero
    _.each(polygon.vertices, function (v, i) {
      var curX = v.x;
      v.x = startX;

      anitype.addTween(v, {
        to: { x: curX },
        easing: easing,
        duration: 0.5, // Value from 0 - 1
        start: 0, // Value from 0 - 1
        complete: function () {
          anitype.addTween(v, {
            to: { x: startX },
            easing: easing,
            duration: 0.5, // Value from 0 - 1
            start: 0.5, // Value from 0 - 1
          });
        },
      }); // addTween
    }); // each

    // Return your polygon wrapped in a group.
    return two.makeGroup(polygon);
  },
});

//---------------------------------

/**
 * Register your submission and choose a character
 * For more information check out the documentation
 * http://anitype.com/documentation
 */
Anitype.register("X", {
  // Enter your name
  author: "creativethumbs",

  // Enter a personal website, must have http
  website: "http://twitter.com/creativethumbs",

  // Make your animation here
  construct: function (two, points) {
    // Reference to instance
    var anitype = this;

    // Create a Two.Polygon
    var polygon = anitype.makePolygon(points);

    // Set an initial state
    //polygon.scale = 0.5;
    polygon.vertices[0].set(-523, -50); // left top -186, -337
    polygon.vertices[1].set(151, -50); // left bottom 186, 337
    polygon.vertices[2].set(-186, -385); //right top 186, -337
    polygon.vertices[3].set(-186, 337); // right bottom -186, 337

    // Create the animation via a tween
    anitype.addTween(polygon.vertices[2], {
      to: { x: 186, y: -337 },
      easing: Anitype.Easing.Bounce.Out,
      duration: 0.4, // Value from 0 - 1
      start: 0.2, // Value from 0 - 1
    });

    anitype.addTween(polygon.vertices[0], {
      to: { x: -320, y: -200 },
      easing: Anitype.Easing.Bounce.Out,
      duration: 0.4, // Value from 0 - 1
      start: 0.2, // Value from 0 - 1
      complete: function () {
        anitype.addTween(polygon.vertices[0], {
          to: { x: -186, y: -337 },
          easing: Anitype.Easing.Bounce.Out,
          duration: 0.4, // Value from 0 - 1
          start: 0.6, // Value from 0 - 1
        });
      },
    });

    anitype.addTween(polygon.vertices[1], {
      to: { x: 320, y: 140 },
      easing: Anitype.Easing.Bounce.Out,
      duration: 0.4, // Value from 0 - 1
      start: 0.2, // Value from 0 - 1
      complete: function () {
        anitype.addTween(polygon.vertices[1], {
          to: { x: 186, y: 337 },
          easing: Anitype.Easing.Bounce.Out,
          duration: 0.4, // Value from 0 - 1
          start: 0.6, // Value from 0 - 1
        });
      },
    });

    // Return your polygon wrapped in a group.
    return two.makeGroup(polygon);
  },
});

//----------------------------

/**
 * Register your submission and choose a character
 * For more information check out the documentation
 * http://anitype.com/documentation
 */
Anitype.register("Y", {
  // Enter your name
  author: "creativethumbs",

  // Enter a personal website, must have http
  website: "http://twitter.com/creativethumbs",

  // Make your animation here
  construct: function (two, points) {
    // Reference to instance
    var anitype = this;
    // Create a Two.Polygon
    var polygon = anitype.makePolygon(points);

    // Create the animation via a tween
    anitype.addTick(function (percent) {
      for (var i = 0; i < points.length / 2; i++) {
        var point = points[i];
        point.y -= 18 * Math.sin(percent) * Math.cos(percent / 3);
      }
    });

    //slightly modified from Chris Delbuck's 'A' animation
    _.each(polygon.vertices, function (vert, i) {
      var time = { value: 0 };
      var angleStep = (Math.PI * 2) / polygon.vertices.length;
      vert.oX = vert.x;
      vert.oAngle = Math.sin(vert.x / 3 + i * angleStep);
      anitype.addTween(time, {
        to: { value: 2.2 }, //changes speed
        easing: Anitype.Easing.Linear.None,
        duration: 1,
        start: 0,
        update: function () {
          var angle = vert.oAngle + this.value * Math.PI;
          vert.x = Math.sin(angle) * vert.oX;
        },
      });
    });

    // Return your polygon wrapped in a group.
    return two.makeGroup(polygon);
  },
});

//------------------------

/**
 * Register your submission and choose a character
 * For more information check out the documentation
 * http://anitype.com/documentation
 */
Anitype.register("Y", {
  // Enter your name
  author: "Wanfang",

  // Enter a personal website, must have http
  website: "http://dropr.com/wanfangdiao",

  // Make your animation here
  construct: function (two, points) {
    // Reference to instance
    var anitype = this;

    // Change duration of animation
    //this.duration = 2000;

    // Create a Two.Polygon
    var polygon = anitype.makePolygon(points);

    //console.log(polygon.vertices);

    // Set an initial state

    anitype.addTween(polygon.vertices[0], {
      to: { x: -186 },
      easing: Anitype.Easing.Quadratic.InOut,
      duration: 0.25, // Value from 0 - 1
      start: 0, // Value from 0 - 1
      complete: function () {
        anitype.addTween(polygon.vertices[0], {
          to: { x: 109 },
          easing: Anitype.Easing.Quadratic.InOut,
          duration: 0.25, // Value from 0 - 1
          start: 0.26,
          complete: function () {
            anitype.addTween(polygon.vertices[0], {
              to: { x: -288 },
              easing: Anitype.Easing.Quadratic.InOut,
              duration: 0.25, // Value from 0 - 1
              start: 0.51,
              complete: function () {
                anitype.addTween(polygon.vertices[0], {
                  to: { x: -186 },
                  easing: Anitype.Easing.Quadratic.InOut,
                  duration: 0.24, // Value from 0 - 1
                  start: 0.76,
                });
              },
            });
          },
        });
      },
    });
    anitype.addTween(polygon.vertices[2], {
      to: { x: 186 },
      easing: Anitype.Easing.Quadratic.InOut,
      duration: 0.25, // Value from 0 - 1
      start: 0, // Value from 0 - 1
      complete: function () {
        anitype.addTween(polygon.vertices[2], {
          to: { x: -109 },
          easing: Anitype.Easing.Quadratic.InOut,
          duration: 0.25, // Value from 0 - 1
          start: 0.26,
          complete: function () {
            anitype.addTween(polygon.vertices[2], {
              to: { x: 288 },
              easing: Anitype.Easing.Quadratic.InOut,
              duration: 0.25, // Value from 0 - 1
              start: 0.51,
              complete: function () {
                anitype.addTween(polygon.vertices[2], {
                  to: { x: 186 },
                  easing: Anitype.Easing.Quadratic.InOut,
                  duration: 0.24, // Value from 0 - 1
                  start: 0.76,
                });
              },
            });
          },
        });
      },
    });
    anitype.addTween(polygon.vertices[4], {
      to: { x: -150 },
      easing: Anitype.Easing.Quadratic.InOut,
      duration: 0.25, // Value from 0 - 1
      start: 0, // Value from 0 - 1
      complete: function () {
        anitype.addTween(polygon.vertices[4], {
          to: { x: 0 },
          easing: Anitype.Easing.Quadratic.InOut,
          duration: 0.25, // Value from 0 - 1
          start: 0.26,
          complete: function () {
            anitype.addTween(polygon.vertices[4], {
              to: { x: 150 },
              easing: Anitype.Easing.Quadratic.InOut,
              duration: 0.25, // Value from 0 - 1
              start: 0.51,
              complete: function () {
                anitype.addTween(polygon.vertices[4], {
                  to: { x: 0 },
                  easing: Anitype.Easing.Quadratic.InOut,
                  duration: 0.24, // Value from 0 - 1
                  start: 0.76,
                });
              },
            });
          },
        });
      },
    });

    // Return your polygon wrapped in a group.
    return two.makeGroup(polygon);
  },
});

//----------------------------

/**
 * Register your submission and choose a character
 * For more information check out the documentation
 * http://anitype.com/documentation
 */
Anitype.register("W", {
  author: "Wanfang Diao",

  website: "http://dropr.com/wanfangdiao",

  construct: function (two, points) {
    var anitype = this;

    var polygon = anitype.makePolygon(points).subdivide();
    var dimensions = polygon.getBoundingClientRect();
    var angleStep = (Math.PI * 2) / polygon.vertices.length;

    _.each(polygon.vertices, function (vert, i) {
      var time = { value: 0 };
      vert.oX = vert.x;
      vert.oAngle = Math.cos(vert.x / dimensions.width / 2 + i * angleStep);
      anitype.addTween(time, {
        to: { value: 0.5 },
        easing: Anitype.Easing.Linear.None,
        duration: 0.74,
        start: 0.25,
        update: function () {
          var angle = vert.oAngle + this.value * Math.PI * 4;
          vert.x = (Math.cos(angle) - Math.cos(2 * angle)) * vert.oX;
        },
      });
    });

    return two.makeGroup(polygon);
  },
});

//----------------------

/**
 * Register your submission and choose a character
 * For more information check out the documentation
 * http://anitype.com/documentation
 */
Anitype.register("Z", {
  // Enter your name
  author: "Yingri Guan",

  // Enter a personal website, must have http
  website: "http://yingriguan.com/",

  // Make your animation here
  construct: function (two, points) {
    // Reference to instance
    var anitype = this;
    this.duration = 1000;

    // Create a Two.Polygon
    var polygon = anitype.makePolygon(points);
    // Set an initial state
    polygon.vertices[0].set(-200, 345);
    polygon.vertices[1].set(-200, -345); // top
    polygon.vertices[2].set(200, -345); // right bottom
    polygon.vertices[3].set(-200, 345); // left short arm
    //polygon.vertices[4].set(215, 328); // left short arm
    // Create the animation via a tween

    anitype.addTween(polygon.vertices[0], {
      to: { x: -200, y: -345 },
      easing: Anitype.Easing.Bounce.Out,
      duration: 1, // Value from 0 - 1
      start: 0,
    });

    anitype.addTween(polygon.vertices[1], {
      to: { x: 200, y: -345 },
      easing: Anitype.Easing.Bounce.Out,
      duration: 1, // Value from 0 - 1
      start: 0,
    });

    anitype.addTween(polygon.vertices[2], {
      to: { x: -200, y: 345 },
      easing: Anitype.Easing.Bounce.Out,
      duration: 1, // Value from 0 - 1
      start: 0,
    });

    anitype.addTween(polygon.vertices[3], {
      to: { x: 200, y: 345 },
      easing: Anitype.Easing.Bounce.Out,
      duration: 1, // Value from 0 - 1
      start: 0, // Value from 0 - 1
    });

    // Return your polygon wrapped in a group.
    return two.makeGroup(polygon);
  },
});

//---------------------------

Anitype.register("8", {
  author: "Yingri Guan",

  website: "http://yingriguan.com/",

  construct: function (two, points) {
    var anitype = this;

    var polygon = anitype.makePolygon(points);
    polygon.subdivide(5);
    var circles = _.map(polygon.vertices, function (v) {
      return two.makeCircle(0, 0, 12);
    });

    anitype.addTick(function (percent) {
      var t = [];
      var l = polygon.vertices.length;

      for (var i = 0; i < l; i++) {
        var p = (percent * 8) % 1;
        var v1 = polygon.vertices[i];
        var v2 = polygon.vertices[(i + 8) % l];
        t[i] = { x: v1.x + p * (v2.x - v1.x), y: v1.y + p * (v2.y - v1.y) };
      }

      for (i = 0; i < circles.length; i++) {
        var c = circles[i];
        c.translation.x = t[i].x;
        c.translation.y = t[i].y;
      }
    });

    return two.makeGroup(circles);
  },
});
