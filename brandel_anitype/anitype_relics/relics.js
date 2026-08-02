(function() {
  'use strict';

  var WIDTH = 900;
  var HEIGHT = 300;
  var CYCLE_MS = 4000;
  var COLUMNS = 13;
  var GLYPH_SIZE = 60;
  var CELL_W = 66;
  var CELL_H = 125;
  var X0 = 48;
  var Y0 = 88;
  var STAGE_HALF_SIZE = 500;
  var STAGE_FADE_START_DISTANCE = 1000;
  var STAGE_FADE_DISTANCE = 500;
  var PERF_ENABLED = false;
  var PERF_REPORT_INTERVAL_MS = 1000;
  var PERF_END_FRACTION = 0.85;
  var PERF_TOP_COUNT = 10;
  var EXCLUDED_RELICS = [
    { letter: 'O', author: 'LValley' },
    { letter: 'X', author: 'vermilly' },
    { letter: 'S', author: 'vermilly' },
    { author: 'Collin Burger' },
    { author: 'Max Hawkins' },
    { letter: 'L', author: 'KLoney' },
    { author: 'kdloney' },
    { letter: 'C', author: 'Jack' }
  ];

  var two;
  var relics = [];
  var cycle = -1;
  var lastPerfReport = 0;
  var stage;
  var hitLayer;
  var tooltip;
  var tooltipX = 0;
  var tooltipY = 0;
  var tooltipFrame = false;

  window.addEventListener('DOMContentLoaded', function() {
    stage = document.querySelector('#stage');
    relics = collectRelics();
    HEIGHT = layoutHeight(relics.length);
    stage.style.height = HEIGHT + 'px';

    two = new Two({
      type: Two.Types.svg,
      width: WIDTH,
      height: HEIGHT,
      autostart: true
    }).appendTo(stage);

    hitLayer = createHitLayer();
    tooltip = createTooltip();
    createHitZones();
    rebuildRelics();

    two.bind('update', function() {
      var now = performance.now();
      var nextCycle = Math.floor(now / CYCLE_MS);
      if (nextCycle !== cycle) {
        if (PERF_ENABLED && cycle !== -1) {
          reportPerf(now, 1, true);
        }
        cycle = nextCycle;
        rebuildRelics();
      }

      var t = now % CYCLE_MS;
      var percent = PERF_ENABLED ? t / CYCLE_MS : 0;
      _.each(relics, function(relic) {
        if (relic.instance) {
          if (PERF_ENABLED) {
            var start = performance.now();
            relic.instance.update(t);
            recordPerf(relic, (performance.now() - start) * 1000, percent);
          } else {
            relic.instance.update(t);
          }
          applyStageFade(relic.group);
        }
      });
      if (PERF_ENABLED) {
        reportPerf(now, percent);
      }
    });
  });

  function collectRelics() {
    var result = [];
    _.each(Anitype.Characters, function(submissions, letter) {
      _.each(submissions, function(submission, index) {
        if (isExcludedRelic(letter, submission)) {
          return;
        }
        result.push({
          letter: letter,
          submission: submission,
          index: index,
          label: letter + ' / ' + (submission.author || 'Unknown') + ' #' + index
        });
      });
    });

    result.sort(function(a, b) {
      var ak = sortKey(a);
      var bk = sortKey(b);
      return ak.localeCompare(bk);
    });

    return result;
  }

  function isExcludedRelic(letter, submission) {
    var author = submission.author || '';
    return _.some(EXCLUDED_RELICS, function(exclusion) {
      var letterMatches = !exclusion.letter || exclusion.letter === letter;
      var authorMatches = !exclusion.author || exclusion.author === author;
      return letterMatches && authorMatches;
    });
  }

  function sortKey(relic) {
    var letter = relic.letter;
    var bucket = /^[A-Z]$/.test(letter) ? '1' : '0';
    return bucket + letter + String(relic.index).padStart(3, '0');
  }

  function layoutHeight(count) {
    var rows = Math.ceil(count / COLUMNS);
    return Y0 + Math.max(0, rows - 1) * CELL_H + 72;
  }

  function rebuildRelics() {
    two.clear();

    _.each(relics, function(relic, i) {
      var col = i % COLUMNS;
      var row = Math.floor(i / COLUMNS);
      var cell = two.makeGroup();
      cell.translation.set(X0 + col * CELL_W, Y0 + row * CELL_H);
      cell.scale = GLYPH_SIZE / Anitype.Dimensions.height;

      relic.perf = PERF_ENABLED ? createPerfRecord(relic) : null;
      relic.instance = new RelicAnitype(CYCLE_MS);
      var points = makePoints(relic.letter);
      var group;

      try {
        group = relic.submission.construct.call(relic.instance, two, points);
      } catch (error) {
        console.warn('Relic failed; falling back to static glyph', relic.letter, relic.submission.author, error);
        group = Anitype.defaultSubmission.construct.call(relic.instance, two, points);
      }

      if (group) {
        normalizeStyle(group);
        relic.group = group;
        applyStageFade(group);
        cell.add(group);
      }
    });

    two.update();
  }

  function applyStageFade(item) {
    fadeItem(item, []);
  }

  function fadeItem(item, transforms) {
    if (!item) {
      return;
    }

    var nextTransforms = transforms.concat(itemTransform(item));

    if (item.vertices && item.vertices.length) {
      if (item._relicBaseOpacity === undefined) {
        item._relicBaseOpacity = _.isNumber(item.opacity) ? item.opacity : 1;
      }
      item.opacity = item._relicBaseOpacity * fadeForVertices(item.vertices, nextTransforms);
    }

    if (item.children) {
      _.each(item.children, function(child) {
        fadeItem(child, nextTransforms);
      });
    }
  }

  function fadeForVertices(vertices, transforms) {
    var maxDistance = 0;

    _.each(vertices, function(vertex) {
      maxDistance = Math.max(maxDistance, distanceOutsideStage(transformPoint(vertex, transforms)));

      if (vertex.controls) {
        if (vertex.controls.left) {
          maxDistance = Math.max(maxDistance, distanceOutsideStage(transformPoint(vertex.controls.left, transforms)));
        }
        if (vertex.controls.right) {
          maxDistance = Math.max(maxDistance, distanceOutsideStage(transformPoint(vertex.controls.right, transforms)));
        }
      }
    });

    var fadeDistance = Math.max(maxDistance - STAGE_FADE_START_DISTANCE, 0);
    return clamp(1 - fadeDistance / STAGE_FADE_DISTANCE, 0, 1);
  }

  function transformPoint(point, transforms) {
    var x = point.x || 0;
    var y = point.y || 0;

    for (var i = transforms.length - 1; i >= 0; i--) {
      var transform = transforms[i];
      var cos = Math.cos(transform.rotation);
      var sin = Math.sin(transform.rotation);
      var rx = x * cos - y * sin;
      var ry = x * sin + y * cos;
      x = rx * transform.scale + transform.x;
      y = ry * transform.scale + transform.y;
    }

    return { x: x, y: y };
  }

  function itemTransform(item) {
    return {
      x: item.translation ? item.translation.x || 0 : 0,
      y: item.translation ? item.translation.y || 0 : 0,
      scale: _.isNumber(item.scale) ? item.scale : 1,
      rotation: _.isNumber(item.rotation) ? item.rotation : 0
    };
  }

  function distanceOutsideStage(point) {
    var dx = Math.max(Math.abs(point.x) - STAGE_HALF_SIZE, 0);
    var dy = Math.max(Math.abs(point.y) - STAGE_HALF_SIZE, 0);
    return Math.sqrt(dx * dx + dy * dy);
  }

  function clamp(value, minValue, maxValue) {
    return Math.max(minValue, Math.min(maxValue, value));
  }

  function createPerfRecord(relic) {
    return {
      label: relic.label,
      samples: 0,
      endSamples: 0,
      totalUs: 0,
      endTotalUs: 0,
      maxUs: 0,
      endMaxUs: 0,
      lastUs: 0,
      tweens: 0
    };
  }

  function recordPerf(relic, elapsedUs, percent) {
    if (!PERF_ENABLED || !relic.perf) {
      return;
    }

    var perf = relic.perf;
    perf.samples++;
    perf.totalUs += elapsedUs;
    perf.lastUs = elapsedUs;
    perf.maxUs = Math.max(perf.maxUs, elapsedUs);
    perf.tweens = relic.instance ? relic.instance.tweens.length : 0;

    if (percent >= PERF_END_FRACTION) {
      perf.endSamples++;
      perf.endTotalUs += elapsedUs;
      perf.endMaxUs = Math.max(perf.endMaxUs, elapsedUs);
    }
  }

  function reportPerf(now, percent, force) {
    if (!PERF_ENABLED || (!force && now - lastPerfReport < PERF_REPORT_INTERVAL_MS)) {
      return;
    }
    lastPerfReport = now;

    var rows = _.chain(relics)
      .pluck('perf')
      .compact()
      .filter(function(perf) {
        return perf.samples > 0;
      })
      .sortBy(function(perf) {
        return -Math.max(perf.maxUs, perf.endMaxUs);
      })
      .first(PERF_TOP_COUNT)
      .map(function(perf) {
        return {
          relic: perf.label,
          lastUs: Math.round(perf.lastUs),
          avgUs: Math.round(perf.totalUs / perf.samples),
          maxUs: Math.round(perf.maxUs),
          endAvgUs: perf.endSamples ? Math.round(perf.endTotalUs / perf.endSamples) : 0,
          endMaxUs: Math.round(perf.endMaxUs),
          tweens: perf.tweens,
          samples: perf.samples
        };
      })
      .value();

    window.AnitypeRelicPerf = rows;
    if (force) {
      window.AnitypeRelicPerfFinal = rows;
    }
  }

  function makePoints(letter) {
    return _.map(Anitype.Endpoints[letter], function(o) {
      var l = o.controls && o.controls.left ? o.controls.left : o;
      var r = o.controls && o.controls.right ? o.controls.right : o;
      return new Two.Anchor(o.x, o.y, l.x, l.y, r.x, r.y, o.command);
    });
  }

  function RelicAnitype(duration) {
    this.duration = duration;
    this.tweens = [];
  }

  _.extend(RelicAnitype.prototype, {
    makePolygon: function() {
      var points = arguments[0];
      if (!_.isArray(points)) {
        points = _.toArray(arguments);
      }
      return new Two.Polygon(points || [], false, false, true);
    },

    addTween: function(object, params) {
      params = params || {};

      _.each(params.from, function(v, k) {
        object[k] = v;
      });

      var tween = new TWEEN.Tween(object)
        .to(params.to || {}, Math.max(0, Math.round((params.duration || 0) * this.duration)))
        .delay(Math.max(0, Math.round((params.start || 0) * this.duration)))
        .easing(params.easing || Anitype.Easing.Linear.None)
        .onStart(params.setup || _.identity)
        .onUpdate(params.update || _.identity)
        .onComplete(params.complete || _.identity)
        .start(0);

      TWEEN.remove(tween);
      this.tweens.push(tween);

      return this;
    },

    addTick: function(func, easing) {
      var clock = {};
      var tween = new TWEEN.Tween(clock)
        .to({}, this.duration)
        .onUpdate(func || _.identity)
        .easing(easing || Anitype.Easing.Linear.None)
        .start(0);

      TWEEN.remove(tween);
      this.tweens.push(tween);

      return this;
    },

    update: function(time) {
      var snapshot = this.tweens.slice();
      var active = [];
      _.each(snapshot, function(tween) {
        if (tween.update(time) !== false) {
          active.push(tween);
        }
      });

      if (this.tweens.length > snapshot.length) {
        active = active.concat(this.tweens.slice(snapshot.length));
      }

      this.tweens = active;
    }
  });

  function normalizeStyle(item) {
    if (!item) {
      return;
    }

    if (_.isFunction(item.noFill)) {
      item.noFill();
    }
    if ('stroke' in item) {
      item.stroke = 'white';
    }
    if ('linewidth' in item) {
      item.linewidth = 24;
    }
    if ('cap' in item) {
      item.cap = 'round';
    }
    if ('join' in item) {
      item.join = 'round';
    }

    if (item.children) {
      _.each(item.children, normalizeStyle);
    }
  }

  function createTooltip() {
    var elem = document.createElement('div');
    elem.className = 'tooltip';
    elem.style.display = 'none';
    document.body.appendChild(elem);
    return elem;
  }

  function createHitLayer() {
    var elem = document.createElement('div');
    elem.className = 'hit-layer';
    stage.appendChild(elem);
    return elem;
  }

  function createHitZones() {
    hitLayer.innerHTML = '';
    _.each(relics, function(relic, i) {
      var col = i % COLUMNS;
      var row = Math.floor(i / COLUMNS);
      var elem = document.createElement('div');
      elem.className = 'relic-hit';
      elem.style.left = X0 + col * CELL_W - CELL_W * 0.45 + 'px';
      elem.style.top = Y0 + row * CELL_H - CELL_H * 0.55 + 'px';
      elem.style.width = CELL_W + 'px';
      elem.style.height = CELL_H + 'px';
      attachTooltip(elem, relic);
      hitLayer.appendChild(elem);
    });
  }

  function attachTooltip(elem, relic) {
    var label = relic.submission.author || 'Unknown';

    elem.addEventListener('mouseenter', function(e) {
      tooltip.textContent = label;
      tooltip.style.display = 'block';
      moveTooltip(e);
    });
    elem.addEventListener('mousemove', moveTooltip);
    elem.addEventListener('mouseleave', function() {
      tooltip.style.display = 'none';
    });
  }

  function moveTooltip(e) {
    tooltipX = e.clientX + 12;
    tooltipY = e.clientY + 12;

    if (tooltipFrame) {
      return;
    }

    tooltipFrame = true;
    requestAnimationFrame(function() {
      tooltip.style.transform = 'translate(' + tooltipX + 'px, ' + tooltipY + 'px)';
      tooltipFrame = false;
    });
  }
})();
