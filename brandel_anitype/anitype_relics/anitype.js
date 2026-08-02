(function() {

  var root = this;
  var previousAnitype = root.Anitype || {};
  var EMPTY = {};

  var Anitype = root.Anitype = function(str, options) {

    var params = _.defaults(options || {}, {
      fill: 'transparent',
      stroke: '#333',
      cap: 'round',
      join: 'round',
      linewidth: 3,
      size: 100,
      miter: 4,
      opacity: 1,
      duration: 1000
    });

    this.tweens = [];

    var characters = str.toUpperCase().split('');
    var characterAmount = characters.length;

    var dimensions = Anitype.Dimensions;
    var scale = this.scale = dimensions.height / params.size;
    var aspectRatio = dimensions.width / dimensions.height;
    var height = this.height = params.size;
    var kerning = (dimensions.spacing + params.linewidth);
    var width = this.width = params.size * aspectRatio;

    // TOOD: Add the possibility for custom spacing

    // Params
    this.linewidth = params.linewidth * scale;
    this.stroke = params.stroke;
    this.fill = params.fill;
    this.cap = params.cap;
    this.join = params.join;
    this.miter = params.miter;
    this.opacity = params.opacity;
    this.duration = params.duration;

    this._internal = !params.two;
    var two = this.two = params.two || new Two({
      width: Math.ceil((width * characters.length)),
      height: Math.ceil(height)
    });

    this.scene = two.makeGroup();
    this.scene.scale /= scale;

    this.setup(characters);

    Anitype.Instances.push(this);

  };

  _.extend(Anitype, {

    Version: 0.3,

    Dimensions: {

      width: 1000,

      height: 1000,

      spacing: 16

    },

    getEndpoints: function(letter, size) {

      var scale = Anitype.Dimensions.height / (size || 1);
      var verts = Anitype.Endpoints[letter.toUpperCase()];

      return _.map(verts, function(v) {
        var controls = v.controls;
        return {
          command: v.command,
          x: v.x / scale,
          y: v.y / scale,
          controls: {
            left: {
              x: ((controls && controls.left) || v).x / scale,
              y: ((controls && controls.left) || v).y / scale
            },
            right: {
              x: ((controls && controls.right) || v).x / scale,
              y: ((controls && controls.right) || v).y / scale
            }
          }
        };
      });

    },

    Instances: [],

    // Pulled from extract.html
    Endpoints: {"0":[{"command":"M","x":0,"y":-338,"controls":{"left":{"x":0,"y":-338},"right":{"x":-73,"y":-338}}},{"command":"C","x":-174,"y":-158,"controls":{"left":{"x":-174,"y":-309},"right":{"x":-174,"y":-7}}},{"command":"C","x":-174,"y":197,"controls":{"left":{"x":-174,"y":102},"right":{"x":-174,"y":292}}},{"command":"C","x":0,"y":338,"controls":{"left":{"x":-64,"y":338},"right":{"x":65,"y":338}}},{"command":"C","x":174,"y":197,"controls":{"left":{"x":174,"y":293},"right":{"x":174,"y":101}}},{"command":"C","x":174,"y":-158,"controls":{"left":{"x":174,"y":-6},"right":{"x":174,"y":-310}}},{"command":"C","x":0,"y":-338,"controls":{"left":{"x":74,"y":-338},"right":{"x":0,"y":-338}}},{"command":"M","x":0,"y":0,"controls":{"left":{"x":0,"y":0},"right":{"x":0,"y":0}}},{"command":"L","x":0,"y":0,"controls":{"left":{"x":0,"y":0},"right":{"x":0,"y":0}}}],"1":[{"command":"M","x":-46,"y":-205,"controls":{"left":{"x":-46,"y":-205},"right":{"x":-46,"y":-205}}},{"command":"L","x":46,"y":-337,"controls":{"left":{"x":46,"y":-337},"right":{"x":46,"y":-337}}},{"command":"L","x":46,"y":337,"controls":{"left":{"x":46,"y":337},"right":{"x":46,"y":337}}}],"2":[{"command":"M","x":-159,"y":-188,"controls":{"left":{"x":-159,"y":-188},"right":{"x":-159,"y":-259}}},{"command":"C","x":-3,"y":-336,"controls":{"left":{"x":-109,"y":-336},"right":{"x":102,"y":-336}}},{"command":"C","x":162,"y":-188,"controls":{"left":{"x":162,"y":-269},"right":{"x":162,"y":-107}}},{"command":"C","x":-3,"y":52,"controls":{"left":{"x":135,"y":-22},"right":{"x":-142,"y":126}}},{"command":"C","x":-174,"y":239,"controls":{"left":{"x":-174,"y":191},"right":{"x":-174,"y":239}}},{"command":"L","x":-174,"y":336,"controls":{"left":{"x":-174,"y":336},"right":{"x":-174,"y":336}}},{"command":"L","x":174,"y":336,"controls":{"left":{"x":174,"y":336},"right":{"x":174,"y":336}}}],"3":[{"command":"M","x":-158,"y":-197,"controls":{"left":{"x":-158,"y":-197},"right":{"x":-158,"y":-300}}},{"command":"C","x":9,"y":-338,"controls":{"left":{"x":-83,"y":-338},"right":{"x":100,"y":-338}}},{"command":"C","x":156,"y":-190,"controls":{"left":{"x":156,"y":-275},"right":{"x":156,"y":-105}}},{"command":"C","x":3,"y":-23,"controls":{"left":{"x":104,"y":-23},"right":{"x":3,"y":-23}}},{"command":"L","x":3,"y":-23,"controls":{"left":{"x":3,"y":-23},"right":{"x":104,"y":-23}}},{"command":"C","x":175,"y":169,"controls":{"left":{"x":175,"y":60},"right":{"x":175,"y":278}}},{"command":"C","x":-3,"y":338,"controls":{"left":{"x":107,"y":338},"right":{"x":-112,"y":338}}},{"command":"C","x":-175,"y":197,"controls":{"left":{"x":-175,"y":265},"right":{"x":-175,"y":197}}}],"4":[{"command":"M","x":73,"y":-336,"controls":{"left":{"x":73,"y":-336},"right":{"x":73,"y":-336}}},{"command":"L","x":-184,"y":160,"controls":{"left":{"x":-184,"y":160},"right":{"x":-184,"y":160}}},{"command":"L","x":184,"y":160,"controls":{"left":{"x":184,"y":160},"right":{"x":184,"y":160}}},{"command":"M","x":100,"y":-62,"controls":{"left":{"x":100,"y":-62},"right":{"x":100,"y":-62}}},{"command":"L","x":100,"y":336,"controls":{"left":{"x":100,"y":336},"right":{"x":100,"y":336}}}],"5":[{"command":"M","x":142,"y":-338,"controls":{"left":{"x":142,"y":-338},"right":{"x":142,"y":-338}}},{"command":"L","x":-122,"y":-338,"controls":{"left":{"x":-122,"y":-338},"right":{"x":-122,"y":-338}}},{"command":"L","x":-138,"y":-43,"controls":{"left":{"x":-138,"y":-43},"right":{"x":-138,"y":-43}}},{"command":"C","x":1,"y":-43,"controls":{"left":{"x":-138,"y":-43},"right":{"x":140,"y":-43}}},{"command":"C","x":174,"y":158,"controls":{"left":{"x":174,"y":47},"right":{"x":174,"y":269}}},{"command":"C","x":1,"y":338,"controls":{"left":{"x":98,"y":338},"right":{"x":-96,"y":338}}},{"command":"C","x":-174,"y":194,"controls":{"left":{"x":-174,"y":287},"right":{"x":-174,"y":194}}}],"6":[{"command":"M","x":174,"y":-197,"controls":{"left":{"x":174,"y":-197},"right":{"x":174,"y":-292}}},{"command":"C","x":-9,"y":-338,"controls":{"left":{"x":66,"y":-338},"right":{"x":-84,"y":-338}}},{"command":"C","x":-174,"y":-197,"controls":{"left":{"x":-174,"y":-292},"right":{"x":-174,"y":-102}}},{"command":"C","x":-174,"y":158,"controls":{"left":{"x":-174,"y":6},"right":{"x":-174,"y":309}}},{"command":"C","x":-9,"y":338,"controls":{"left":{"x":-71,"y":338},"right":{"x":79,"y":338}}},{"command":"C","x":174,"y":158,"controls":{"left":{"x":174,"y":310},"right":{"x":174,"y":6}}},{"command":"C","x":-9,"y":-40,"controls":{"left":{"x":113,"y":-40},"right":{"x":-72,"y":-40}}},{"command":"C","x":-174,"y":158,"controls":{"left":{"x":-174,"y":6},"right":{"x":-174,"y":158}}}],"7":[{"command":"M","x":-175,"y":-195,"controls":{"left":{"x":-175,"y":-195},"right":{"x":-175,"y":-195}}},{"command":"L","x":-175,"y":-336,"controls":{"left":{"x":-175,"y":-336},"right":{"x":-175,"y":-336}}},{"command":"L","x":175,"y":-336,"controls":{"left":{"x":175,"y":-336},"right":{"x":175,"y":-336}}},{"command":"L","x":175,"y":-256,"controls":{"left":{"x":175,"y":-256},"right":{"x":175,"y":-256}}},{"command":"L","x":-127,"y":336,"controls":{"left":{"x":-127,"y":336},"right":{"x":-127,"y":336}}}],"8":[{"command":"M","x":2,"y":-340,"controls":{"left":{"x":2,"y":-340},"right":{"x":101,"y":-340}}},{"command":"C","x":157,"y":-186,"controls":{"left":{"x":157,"y":-275},"right":{"x":157,"y":-97}}},{"command":"C","x":2,"y":-37,"controls":{"left":{"x":101,"y":-37},"right":{"x":-97,"y":-37}}},{"command":"C","x":-177,"y":168,"controls":{"left":{"x":-177,"y":41},"right":{"x":-177,"y":296}}},{"command":"C","x":2,"y":340,"controls":{"left":{"x":-76,"y":340},"right":{"x":80,"y":340}}},{"command":"C","x":177,"y":168,"controls":{"left":{"x":177,"y":296},"right":{"x":177,"y":41}}},{"command":"C","x":2,"y":-37,"controls":{"left":{"x":101,"y":-37},"right":{"x":-97,"y":-37}}},{"command":"C","x":-153,"y":-186,"controls":{"left":{"x":-153,"y":-97},"right":{"x":-153,"y":-276}}},{"command":"C","x":2,"y":-340,"controls":{"left":{"x":-96,"y":-340},"right":{"x":2,"y":-340}}}],"9":[{"command":"M","x":174,"y":-158,"controls":{"left":{"x":174,"y":-158},"right":{"x":174,"y":-6}}},{"command":"C","x":9,"y":40,"controls":{"left":{"x":72,"y":40},"right":{"x":-113,"y":40}}},{"command":"C","x":-174,"y":-158,"controls":{"left":{"x":-174,"y":-6},"right":{"x":-174,"y":-310}}},{"command":"C","x":9,"y":-338,"controls":{"left":{"x":-79,"y":-338},"right":{"x":71,"y":-338}}},{"command":"C","x":174,"y":-158,"controls":{"left":{"x":174,"y":-309},"right":{"x":174,"y":-6}}},{"command":"C","x":174,"y":197,"controls":{"left":{"x":174,"y":102},"right":{"x":174,"y":292}}},{"command":"C","x":9,"y":338,"controls":{"left":{"x":84,"y":338},"right":{"x":-66,"y":338}}},{"command":"C","x":-174,"y":197,"controls":{"left":{"x":-174,"y":292},"right":{"x":-174,"y":197}}}],"A":[{"command":"M","x":-215,"y":328,"controls":{"left":{"x":-215,"y":328},"right":{"x":-215,"y":328}}},{"command":"L","x":0,"y":-328,"controls":{"left":{"x":0,"y":-328},"right":{"x":0,"y":-328}}},{"command":"L","x":215,"y":328,"controls":{"left":{"x":215,"y":328},"right":{"x":215,"y":328}}},{"command":"M","x":-159,"y":157,"controls":{"left":{"x":-159,"y":157},"right":{"x":-159,"y":157}}},{"command":"L","x":159,"y":157,"controls":{"left":{"x":159,"y":157},"right":{"x":159,"y":157}}}],"B":[{"command":"M","x":-176,"y":337,"controls":{"left":{"x":-176,"y":337},"right":{"x":-176,"y":337}}},{"command":"L","x":-176,"y":-337,"controls":{"left":{"x":-176,"y":-337},"right":{"x":-176,"y":-337}}},{"command":"L","x":-9,"y":-337,"controls":{"left":{"x":-9,"y":-337},"right":{"x":-9,"y":-337}}},{"command":"C","x":158,"y":-182,"controls":{"left":{"x":158,"y":-333},"right":{"x":158,"y":-31}}},{"command":"C","x":-9,"y":-31,"controls":{"left":{"x":-9,"y":-31},"right":{"x":-9,"y":-31}}},{"command":"L","x":-176,"y":-31,"controls":{"left":{"x":-176,"y":-31},"right":{"x":-176,"y":-31}}},{"command":"L","x":-9,"y":-31,"controls":{"left":{"x":-9,"y":-31},"right":{"x":-9,"y":-31}}},{"command":"C","x":176,"y":166,"controls":{"left":{"x":176,"y":-5},"right":{"x":176,"y":337}}},{"command":"C","x":-9,"y":337,"controls":{"left":{"x":-9,"y":337},"right":{"x":-9,"y":337}}},{"command":"L","x":-176,"y":337,"controls":{"left":{"x":-176,"y":337},"right":{"x":-176,"y":337}}}],"C":[{"command":"M","x":175,"y":-190,"controls":{"left":{"x":175,"y":-190},"right":{"x":175,"y":-190}}},{"command":"C","x":0,"y":-338,"controls":{"left":{"x":176,"y":-338},"right":{"x":-175,"y":-338}}},{"command":"C","x":-175,"y":-3,"controls":{"left":{"x":-175,"y":-184},"right":{"x":-175,"y":178}}},{"command":"C","x":0,"y":338,"controls":{"left":{"x":-175,"y":338},"right":{"x":176,"y":338}}},{"command":"C","x":175,"y":187,"controls":{"left":{"x":175,"y":187},"right":{"x":175,"y":187}}}],"D":[{"command":"M","x":-175,"y":337,"controls":{"left":{"x":-175,"y":337},"right":{"x":-175,"y":337}}},{"command":"L","x":-175,"y":-337,"controls":{"left":{"x":-175,"y":-337},"right":{"x":0,"y":-337}}},{"command":"C","x":175,"y":-182,"controls":{"left":{"x":175,"y":-333},"right":{"x":175,"y":-182}}},{"command":"C","x":175,"y":166,"controls":{"left":{"x":175,"y":-5},"right":{"x":175,"y":337}}},{"command":"C","x":-175,"y":337,"controls":{"left":{"x":0,"y":337},"right":{"x":-175,"y":337}}}],"E":[{"command":"M","x":175,"y":-337,"controls":{"left":{"x":175,"y":-337},"right":{"x":175,"y":-337}}},{"command":"L","x":-175,"y":-337,"controls":{"left":{"x":-175,"y":-337},"right":{"x":-175,"y":-337}}},{"command":"L","x":-175,"y":337,"controls":{"left":{"x":-175,"y":337},"right":{"x":-175,"y":337}}},{"command":"L","x":175,"y":337,"controls":{"left":{"x":175,"y":337},"right":{"x":175,"y":337}}},{"command":"M","x":-175,"y":0,"controls":{"left":{"x":-175,"y":0},"right":{"x":-175,"y":0}}},{"command":"L","x":15,"y":0,"controls":{"left":{"x":15,"y":0},"right":{"x":15,"y":0}}}],"F":[{"command":"M","x":175,"y":-337,"controls":{"left":{"x":175,"y":-337},"right":{"x":175,"y":-337}}},{"command":"L","x":-175,"y":-337,"controls":{"left":{"x":-175,"y":-337},"right":{"x":-175,"y":-337}}},{"command":"L","x":-175,"y":337,"controls":{"left":{"x":-175,"y":337},"right":{"x":-175,"y":337}}},{"command":"M","x":-175,"y":0,"controls":{"left":{"x":-175,"y":0},"right":{"x":-175,"y":0}}},{"command":"L","x":15,"y":0,"controls":{"left":{"x":15,"y":0},"right":{"x":15,"y":0}}}],"G":[{"command":"M","x":175,"y":-188,"controls":{"left":{"x":175,"y":-188},"right":{"x":175,"y":-188}}},{"command":"C","x":0,"y":-337,"controls":{"left":{"x":175,"y":-337},"right":{"x":-175,"y":-337}}},{"command":"C","x":-175,"y":0,"controls":{"left":{"x":-175,"y":-183},"right":{"x":-175,"y":183}}},{"command":"C","x":0,"y":337,"controls":{"left":{"x":-175,"y":337},"right":{"x":175,"y":337}}},{"command":"C","x":175,"y":10,"controls":{"left":{"x":175,"y":202},"right":{"x":175,"y":10}}},{"command":"L","x":12,"y":10,"controls":{"left":{"x":12,"y":10},"right":{"x":12,"y":10}}}],"H":[{"command":"M","x":-178,"y":-337,"controls":{"left":{"x":-178,"y":-337},"right":{"x":-178,"y":-337}}},{"command":"L","x":-178,"y":337,"controls":{"left":{"x":-178,"y":337},"right":{"x":-178,"y":337}}},{"command":"M","x":178,"y":-337,"controls":{"left":{"x":178,"y":-337},"right":{"x":178,"y":-337}}},{"command":"L","x":178,"y":337,"controls":{"left":{"x":178,"y":337},"right":{"x":178,"y":337}}},{"command":"M","x":-178,"y":-14,"controls":{"left":{"x":-178,"y":-14},"right":{"x":-178,"y":-14}}},{"command":"L","x":178,"y":-14,"controls":{"left":{"x":178,"y":-14},"right":{"x":178,"y":-14}}}],"I":[{"command":"M","x":0,"y":-337,"controls":{"left":{"x":0,"y":-337},"right":{"x":0,"y":-337}}},{"command":"L","x":0,"y":337,"controls":{"left":{"x":0,"y":337},"right":{"x":0,"y":337}}}],"J":[{"command":"M","x":0,"y":-338,"controls":{"left":{"x":0,"y":-338},"right":{"x":0,"y":-338}}},{"command":"L","x":175,"y":-338,"controls":{"left":{"x":175,"y":-338},"right":{"x":175,"y":-338}}},{"command":"L","x":175,"y":158,"controls":{"left":{"x":175,"y":158},"right":{"x":175,"y":158}}},{"command":"C","x":0,"y":338,"controls":{"left":{"x":175,"y":338},"right":{"x":-175,"y":338}}},{"command":"C","x":-175,"y":187,"controls":{"left":{"x":-175,"y":187},"right":{"x":-175,"y":187}}}],"M":[{"command":"M","x":-225,"y":336,"controls":{"left":{"x":-225,"y":336},"right":{"x":-225,"y":336}}},{"command":"L","x":-225,"y":-336,"controls":{"left":{"x":-225,"y":-336},"right":{"x":-225,"y":-336}}},{"command":"L","x":0,"y":61,"controls":{"left":{"x":0,"y":61},"right":{"x":0,"y":61}}},{"command":"L","x":225,"y":-336,"controls":{"left":{"x":225,"y":-336},"right":{"x":225,"y":-336}}},{"command":"L","x":225,"y":336,"controls":{"left":{"x":225,"y":336},"right":{"x":225,"y":336}}}],"K":[{"command":"M","x":-188,"y":-336,"controls":{"left":{"x":-188,"y":-336},"right":{"x":-188,"y":-336}}},{"command":"L","x":-188,"y":336,"controls":{"left":{"x":-188,"y":336},"right":{"x":-188,"y":336}}},{"command":"M","x":159,"y":-336,"controls":{"left":{"x":159,"y":-336},"right":{"x":159,"y":-336}}},{"command":"L","x":-188,"y":100,"controls":{"left":{"x":-188,"y":100},"right":{"x":-188,"y":100}}},{"command":"M","x":-69,"y":-50,"controls":{"left":{"x":-69,"y":-50},"right":{"x":-69,"y":-50}}},{"command":"L","x":188,"y":336,"controls":{"left":{"x":188,"y":336},"right":{"x":188,"y":336}}}],"L":[{"command":"M","x":-156,"y":-336,"controls":{"left":{"x":-156,"y":-336},"right":{"x":-156,"y":-336}}},{"command":"L","x":-156,"y":336,"controls":{"left":{"x":-156,"y":336},"right":{"x":-156,"y":336}}},{"command":"L","x":156,"y":336,"controls":{"left":{"x":156,"y":336},"right":{"x":156,"y":336}}}],"N":[{"command":"M","x":-178,"y":336,"controls":{"left":{"x":-178,"y":336},"right":{"x":-178,"y":336}}},{"command":"L","x":-178,"y":-336,"controls":{"left":{"x":-178,"y":-336},"right":{"x":-178,"y":-336}}},{"command":"L","x":178,"y":336,"controls":{"left":{"x":178,"y":336},"right":{"x":178,"y":336}}},{"command":"L","x":178,"y":-336,"controls":{"left":{"x":178,"y":-336},"right":{"x":178,"y":-336}}}],"O":[{"command":"M","x":0,"y":-339,"controls":{"left":{"x":0,"y":-339},"right":{"x":-175,"y":-339}}},{"command":"C","x":-175,"y":-16,"controls":{"left":{"x":-175,"y":-217},"right":{"x":-175,"y":185}}},{"command":"C","x":0,"y":339,"controls":{"left":{"x":-175,"y":339},"right":{"x":175,"y":339}}},{"command":"C","x":175,"y":-16,"controls":{"left":{"x":175,"y":185},"right":{"x":175,"y":-217}}},{"command":"C","x":0,"y":-339,"controls":{"left":{"x":175,"y":-339},"right":{"x":0,"y":-339}}}],"P":[{"command":"M","x":-176,"y":337,"controls":{"left":{"x":-176,"y":337},"right":{"x":-176,"y":337}}},{"command":"L","x":-176,"y":41,"controls":{"left":{"x":-176,"y":41},"right":{"x":-176,"y":41}}},{"command":"L","x":-176,"y":-337,"controls":{"left":{"x":-176,"y":-337},"right":{"x":-176,"y":-337}}},{"command":"L","x":-13,"y":-337,"controls":{"left":{"x":-13,"y":-337},"right":{"x":-13,"y":-337}}},{"command":"C","x":176,"y":-148,"controls":{"left":{"x":176,"y":-337},"right":{"x":176,"y":41}}},{"command":"C","x":-14,"y":43,"controls":{"left":{"x":-14,"y":43},"right":{"x":-14,"y":43}}},{"command":"L","x":-176,"y":43,"controls":{"left":{"x":-176,"y":43},"right":{"x":-176,"y":43}}}],"Q":[{"command":"M","x":0,"y":-339,"controls":{"left":{"x":0,"y":-339},"right":{"x":-175,"y":-339}}},{"command":"C","x":-175,"y":-16,"controls":{"left":{"x":-175,"y":-217},"right":{"x":-175,"y":185}}},{"command":"C","x":0,"y":339,"controls":{"left":{"x":-175,"y":339},"right":{"x":175,"y":339}}},{"command":"C","x":175,"y":-16,"controls":{"left":{"x":175,"y":185},"right":{"x":175,"y":-217}}},{"command":"C","x":0,"y":-339,"controls":{"left":{"x":175,"y":-339},"right":{"x":0,"y":-339}}},{"command":"M","x":0,"y":236,"controls":{"left":{"x":0,"y":236},"right":{"x":0,"y":236}}},{"command":"L","x":0,"y":446,"controls":{"left":{"x":0,"y":446},"right":{"x":0,"y":446}}}],"S":[{"command":"M","x":162,"y":-305,"controls":{"left":{"x":162,"y":-305},"right":{"x":162,"y":-305}}},{"command":"C","x":5,"y":-339,"controls":{"left":{"x":96,"y":-339},"right":{"x":-86,"y":-339}}},{"command":"C","x":-155,"y":-190,"controls":{"left":{"x":-155,"y":-282},"right":{"x":-155,"y":-136}}},{"command":"C","x":19,"y":-17,"controls":{"left":{"x":-138,"y":-78},"right":{"x":177,"y":44}}},{"command":"C","x":177,"y":185,"controls":{"left":{"x":177,"y":153},"right":{"x":177,"y":261}}},{"command":"C","x":5,"y":339,"controls":{"left":{"x":127,"y":339},"right":{"x":-118,"y":339}}},{"command":"C","x":-177,"y":260,"controls":{"left":{"x":-177,"y":260},"right":{"x":-177,"y":260}}}],"R":[{"command":"M","x":-176,"y":337,"controls":{"left":{"x":-176,"y":337},"right":{"x":-176,"y":337}}},{"command":"L","x":-176,"y":-337,"controls":{"left":{"x":-176,"y":-337},"right":{"x":-176,"y":-337}}},{"command":"L","x":-13,"y":-337,"controls":{"left":{"x":-13,"y":-337},"right":{"x":-13,"y":-337}}},{"command":"C","x":176,"y":-167,"controls":{"left":{"x":176,"y":-337},"right":{"x":176,"y":4}}},{"command":"C","x":-14,"y":4,"controls":{"left":{"x":-14,"y":4},"right":{"x":-14,"y":4}}},{"command":"L","x":-176,"y":4,"controls":{"left":{"x":-176,"y":4},"right":{"x":-176,"y":4}}},{"command":"M","x":5,"y":4,"controls":{"left":{"x":5,"y":4},"right":{"x":5,"y":4}}},{"command":"L","x":176,"y":337,"controls":{"left":{"x":176,"y":337},"right":{"x":176,"y":337}}}],"T":[{"command":"M","x":-197,"y":-337,"controls":{"left":{"x":-197,"y":-337},"right":{"x":-197,"y":-337}}},{"command":"L","x":197,"y":-337,"controls":{"left":{"x":197,"y":-337},"right":{"x":197,"y":-337}}},{"command":"M","x":0,"y":-337,"controls":{"left":{"x":0,"y":-337},"right":{"x":0,"y":-337}}},{"command":"L","x":0,"y":337,"controls":{"left":{"x":0,"y":337},"right":{"x":0,"y":337}}}],"U":[{"command":"M","x":-178,"y":-337,"controls":{"left":{"x":-178,"y":-337},"right":{"x":-178,"y":-337}}},{"command":"C","x":-178,"y":187,"controls":{"left":{"x":-178,"y":95},"right":{"x":-178,"y":279}}},{"command":"C","x":0,"y":337,"controls":{"left":{"x":-109,"y":337},"right":{"x":109,"y":337}}},{"command":"C","x":178,"y":187,"controls":{"left":{"x":178,"y":279},"right":{"x":178,"y":95}}},{"command":"C","x":178,"y":-337,"controls":{"left":{"x":178,"y":-337},"right":{"x":178,"y":-337}}}],"V":[{"command":"M","x":-215,"y":-340,"controls":{"left":{"x":-215,"y":-340},"right":{"x":-215,"y":-340}}},{"command":"L","x":0,"y":340,"controls":{"left":{"x":0,"y":340},"right":{"x":0,"y":340}}},{"command":"L","x":215,"y":-340,"controls":{"left":{"x":215,"y":-340},"right":{"x":215,"y":-340}}}],"W":[{"command":"M","x":-339,"y":-340,"controls":{"left":{"x":-339,"y":-340},"right":{"x":-339,"y":-340}}},{"command":"L","x":-135,"y":340,"controls":{"left":{"x":-135,"y":340},"right":{"x":-135,"y":340}}},{"command":"L","x":0,"y":-71,"controls":{"left":{"x":0,"y":-71},"right":{"x":0,"y":-71}}},{"command":"L","x":135,"y":340,"controls":{"left":{"x":135,"y":340},"right":{"x":135,"y":340}}},{"command":"L","x":339,"y":-340,"controls":{"left":{"x":339,"y":-340},"right":{"x":339,"y":-340}}}],"X":[{"command":"M","x":-186,"y":-337,"controls":{"left":{"x":-186,"y":-337},"right":{"x":-186,"y":-337}}},{"command":"L","x":186,"y":337,"controls":{"left":{"x":186,"y":337},"right":{"x":186,"y":337}}},{"command":"M","x":185,"y":-337,"controls":{"left":{"x":185,"y":-337},"right":{"x":185,"y":-337}}},{"command":"L","x":-185,"y":337,"controls":{"left":{"x":-185,"y":337},"right":{"x":-185,"y":337}}}],"Y":[{"command":"M","x":-215,"y":-337,"controls":{"left":{"x":-215,"y":-337},"right":{"x":-215,"y":-337}}},{"command":"L","x":-1,"y":48,"controls":{"left":{"x":-1,"y":48},"right":{"x":-1,"y":48}}},{"command":"L","x":215,"y":-337,"controls":{"left":{"x":215,"y":-337},"right":{"x":215,"y":-337}}},{"command":"M","x":-1,"y":48,"controls":{"left":{"x":-1,"y":48},"right":{"x":-1,"y":48}}},{"command":"L","x":-1,"y":337,"controls":{"left":{"x":-1,"y":337},"right":{"x":-1,"y":337}}}],"Z":[{"command":"M","x":-179,"y":-337,"controls":{"left":{"x":-179,"y":-337},"right":{"x":-179,"y":-337}}},{"command":"L","x":170,"y":-337,"controls":{"left":{"x":170,"y":-337},"right":{"x":170,"y":-337}}},{"command":"L","x":-189,"y":337,"controls":{"left":{"x":-189,"y":337},"right":{"x":-189,"y":337}}},{"command":"L","x":189,"y":337,"controls":{"left":{"x":189,"y":337},"right":{"x":189,"y":337}}}],"-":[{"command":"M","x":-164,"y":0,"controls":{"left":{"x":-164,"y":0},"right":{"x":-164,"y":0}}},{"command":"L","x":164,"y":0,"controls":{"left":{"x":164,"y":0},"right":{"x":164,"y":0}}}],"/":[{"command":"M","x":188,"y":-369,"controls":{"left":{"x":188,"y":-369},"right":{"x":188,"y":-369}}},{"command":"L","x":-188,"y":369,"controls":{"left":{"x":-188,"y":369},"right":{"x":-188,"y":369}}}],"*":[{"command":"M","x":-1,"y":-146,"controls":{"left":{"x":-1,"y":-146},"right":{"x":-1,"y":-146}}},{"command":"L","x":-1,"y":12,"controls":{"left":{"x":-1,"y":12},"right":{"x":-1,"y":12}}},{"command":"M","x":-154,"y":-37,"controls":{"left":{"x":-154,"y":-37},"right":{"x":-154,"y":-37}}},{"command":"L","x":-1,"y":12,"controls":{"left":{"x":-1,"y":12},"right":{"x":-1,"y":12}}},{"command":"L","x":-95,"y":146,"controls":{"left":{"x":-95,"y":146},"right":{"x":-95,"y":146}}},{"command":"M","x":154,"y":-37,"controls":{"left":{"x":154,"y":-37},"right":{"x":154,"y":-37}}},{"command":"L","x":-1,"y":12,"controls":{"left":{"x":-1,"y":12},"right":{"x":-1,"y":12}}},{"command":"L","x":97,"y":146,"controls":{"left":{"x":97,"y":146},"right":{"x":97,"y":146}}}],"!":[{"command":"M","x":0,"y":-336,"controls":{"left":{"x":0,"y":-336},"right":{"x":0,"y":-336}}},{"command":"L","x":0,"y":184,"controls":{"left":{"x":0,"y":184},"right":{"x":0,"y":184}}},{"command":"M","x":0,"y":336,"controls":{"left":{"x":0,"y":336},"right":{"x":0,"y":336}}},{"command":"L","x":0,"y":336,"controls":{"left":{"x":0,"y":336},"right":{"x":0,"y":336}}}],"?":[{"command":"M","x":-140,"y":-291,"controls":{"left":{"x":-140,"y":-291},"right":{"x":-140,"y":-291}}},{"command":"C","x":13,"y":-336,"controls":{"left":{"x":-82,"y":-341},"right":{"x":108,"y":-330}}},{"command":"C","x":140,"y":-142,"controls":{"left":{"x":166,"y":-226},"right":{"x":114,"y":-58}}},{"command":"C","x":13,"y":29,"controls":{"left":{"x":53,"y":-23},"right":{"x":-27,"y":81}}},{"command":"C","x":-19,"y":184,"controls":{"left":{"x":-19,"y":184},"right":{"x":-19,"y":184}}},{"command":"M","x":-19,"y":336,"controls":{"left":{"x":-19,"y":336},"right":{"x":-19,"y":336}}},{"command":"L","x":-19,"y":336,"controls":{"left":{"x":-19,"y":336},"right":{"x":-19,"y":336}}}],"+":[{"command":"M","x":0,"y":-157,"controls":{"left":{"x":0,"y":-157},"right":{"x":0,"y":-157}}},{"command":"L","x":0,"y":157,"controls":{"left":{"x":0,"y":157},"right":{"x":0,"y":157}}},{"command":"M","x":-164,"y":0,"controls":{"left":{"x":-164,"y":0},"right":{"x":-164,"y":0}}},{"command":"L","x":164,"y":0,"controls":{"left":{"x":164,"y":0},"right":{"x":164,"y":0}}}]},

    Characters: {

      A: [], B: [], C: [], D: [], E: [], F: [], G: [], H: [], I: [], J: [],
      K: [], L: [], M: [], N: [], O: [], P: [], Q: [], R: [], S: [], T: [],
      U: [], V: [], W: [], X: [], Y: [], Z: [], 0: [], 1: [], 2: [], 3: [],
      4: [], 5: [], 6: [], 7: [], 8: [], 9: [], '*': [], '/': [], '+': [],
      '-': [], '?': [], '!': []

    },

    Easing: TWEEN.Easing,

    register: function(c, submission) {

      submission.id = _.uniqueId();
      Anitype.Characters[c].push(submission);

      return Anitype;

    },

    deregister: function(c, submission) {

      if (_.isString(c) && _.isObject(submission)) {
        var index = _.indexOf(Anitype.Characters[c], submission);
        if (index >= 0) {
          Anitype.Characters[c].splice(index, 1);
        }
        return submission;
      }

      if (_.isString(c)) {
        Anitype.Characters[c].length = 0;
        return c;
      }

      _.each(Anitype.Characters, function(array) {
        array.length = 0;
      });

      return null;

    },

    /**
     * Eval code in the closured environment specific for anitype.
     */
    evaluate: function(script) {

      (function() {

        var window,
          $,
          alert,
          document,
          prompt,
          initialize,
          destroy,
          confirm,
          allTabs,
          origin,
          event,
          addToUrlbarHistory,
          addEventListener,
          addLogo,
          app,
          App,
          buildHelpMenu,
          browserDragAndDrop,
          bookmarksButtonObserver,
          blur,
          back,
          beginWindowMove,
          browserDOMWindow,
          chrome,             // Stuck on the C's for Firefox
          dispatchEvent,
          frames,
          frameElement,
          getEventListeners,
          http,
          history,
          indexedDB,
          jQuery,
          localStorage,
          listeners,
          location,
          locationbar,
          menubar,
          monitorEvents,
          navigator,
          onabort,
          onbeforeunload,
          onblur,
          oncanplay,
          oncanplaythrough,
          onchange,
          onclick,
          oncontextmenu,
          onclick,
          ondblclick,
          ondevicemotion,
          ondeviceorientation,
          ondrag,
          ondragend,
          ondragenter,
          ondragleave,
          ondragover,
          ondragstart,
          ondrop,
          ondurationchange,
          onemptied,
          onended,
          onerror,
          onfocus,
          onhashchange,
          oninput,
          oninvalid,
          onkeydown,
          onkeypress,
          onkeyup,
          onbeforeunloadonloadeddata,
          onloadedmetadata,
          onloadstart,
          onmessaage,
          onmousedown,
          onmouseenter,
          onmouseleave,
          onmousemove,
          onmouseout,
          onmouseover,
          onmouseup,
          onmousewheel,
          onoffline,
          ononline,
          onpagehide,
          onpageshow,
          onpause,
          oncanplayonplaying,
          onpopstate,
          onprogress,
          onratechange,
          onreset,
          onscroll,
          onsearch,
          onseeked,
          onseeking,
          onselect,
          onstalled,
          onstorage,
          onsubmit,
          onsuspend,
          ontimeupdate,
          ontransitionend,
          onbeforeunloadonvolumechange,
          onwaiting,
          onwebkitanimationend,
          onwebkitanimationiteration,
          onwebkitanimationstart,
          onwebkittransitionend,
          onwheel,
          open,
          opener,
          openDatabase,
          parent,
          postMessage,
          personalbar,
          releaseEvents,
          removeEventListener,
          requestAnimationFrame,
          resizeBy,
          resizeTo,
          screen,
          scroll,
          scrollbars,
          self,
          sessionStorage,
          setInterval,
          scrollBy,
          tailbone,
          top,
          toolbar,
          utils,
          webkitAudioContext,
          webkitAudioPannerNode,
          webkitCancelAnimationFrame,
          webkitCancelRequestAnimationFrame,
          webkitConvertpointFromNodeToPage,
          webkitConvertpointFromPageToNode,
          webkitIDBCursor,
          webkitIDBDatabase,
          webkitIDBFactory,
          webkitIDBIndex,
          webkitIDBKeyRange,
          webkitIDBObjectStore,
          webkitIDBRequest,
          webkitIDBTransaction,
          webkitIndexedDB,
          webkitMediaStream,
          webkitNotifications,
          webkitOfflineAudioContext,
          webkitRTCPeerConnection,
          webkitRequestAnimationFrame,
          webkitRequestFileSystem,
          webkitResolveLocalFileSystemURL,
          webkitSpeechGrammar,
          webkitSpeechGrammarList,
          webkitSpeechRecognition,
          webkitSpeechRecognitionError,
          webkitSpeechRecognitionEvent,
          webkitStorageInfo,
          webkitURL;

        'use strict';

        eval(script);

      }).call({});

    },

    defaultSubmission: {

      author: '',

      website: '',

      construct: function(two, points) {

        return two.makeGroup(this.makePolygon(points));

      }

    }

  });

  _.extend(Anitype.prototype, Backbone.Events, {

    appendTo: function(elem) {

      this.two.appendTo(elem);
      return this;

    },

    makePolygon: function() {
      var points = arguments[0];
      if (!_.isArray(points)) {
        points = _.toArray(arguments);
      }
      return new Two.Polygon(points, false, false, true);
    },

    addTick: function(func, easing) {

      var tween = new TWEEN.Tween(EMPTY)
        .to(EMPTY, this.duration)
        .onUpdate(func)
        .easing(easing || Anitype.Easing.Linear.None)
        .start(0)

      TWEEN.remove(tween);
      this.tweens.push(tween);

      return this;

    },

    addTween: function(object, params) {

      _.each(params.from, function(v, k) {
        object[k] = v;
      });

      var tween = new TWEEN.Tween(object)
        .to(params.to, Math.round(params.duration * this.duration))
        .delay(Math.round(params.start * this.duration))
        .easing(params.easing || Anitype.Easing.Linear.None)
        .onStart(params.setup || _.identity)
        .onUpdate(params.update || _.identity)
        .onComplete(params.complete || _.identity)
        .start(0)

      TWEEN.remove(tween);
      this.tweens.push(tween);

      return this;

    },

    clear: function() {

      this.tweens.length = 0;
      return this;

    },

    update: function(time) {

      _.each(this.tweens, function(t) {
        t.update(time);
      });

      if (this._internal) {
        this.two.update();
      }

      return this.trigger('update', time);

    },

    setup: function(chars) {

      var string;

      // Reset the data that's within the two.js context and tweens.

      this.clear();

      if (this.characters && this.characters.length > 0) {
        string = _.map(this.characters, function(c) {
          if (c && _.isFunction(c.remove)) {
            c.remove();
          }
          return c && c.letter ? c.letter : ' ';
        });
        this.characters.length = 0;
      }

      var characters = chars || string;
      var characterAmount = characters.length;
      var two = this.two;
      var dimensions = Anitype.Dimensions;

      // TODO: Update two.js size

      // Create a new set of characters.

      this.characters = _.map(characters, function(c, i) {

        if (/\s/.test(c)) {
          return;
        }

        var possible = Anitype.Characters[c];
        var length = possible.length;
        var selected = Math.floor(Math.random() * possible.length);
        var submission = possible[selected];

        var points = _.map(Anitype.Endpoints[c], function(o) {
          var command = o.command;
          var l = (o.controls && o.controls.left) || {};
          var r = (o.controls && o.controls.right) || {};
          return new Two.Anchor(o.x, o.y, l.x, l.y, r.x, r.y, command);
        });

        var group = submission.construct.call(this, two, points);

        group.letter = c;
        group.stroke = this.stroke;
        group.fill = this.fill;
        group.linewidth = this.linewidth;
        group.cap = this.cap;
        group.join = this.join;
        group.miter = this.miter;
        group.opacity = this.opacity;

        group.translation.set(i * dimensions.width + dimensions.width / 2, dimensions.height / 2);
        group.submission = submission; // Export submission info.

        return group;

      }, this);

      this.scene.add(this.characters);

      return this;

    },

    start: function() {

      if (this.alive) {
        this.setup();
      }

      this.alive = true;
      return this.trigger('start');

    },

    play: function() {

      var _this = this;

      if (this.alive) {
        return this.stop().play();
      }

      if (!this.alive) {
        this.start();
      }

      var time = 0, ptime = Date.now();

      this.__tick = _.bind(function() {

        if (!this.alive) {
          return;
        }

        var ctime = Date.now();
        var timeDelta = ctime - ptime;
        time += timeDelta;

        if (time > this.duration) {
          this.stop();
          return this.trigger('complete');
        }

        this.update(time);
        ptime = ctime;

      }, this);

      return this;

    },

    loop: function() {

      if (this.alive) {
        return this.stop().loop();
      }

      if (!this.alive) {
        this.start();
      }

      var time = 0, ptime = Date.now();

      this.__tick = _.bind(function() {

        var ctime = Date.now();
        var timeDelta = ctime - ptime;
        ptime = ctime;

        if (!this.alive) {
          return;
        }

        time += timeDelta;

        if (time > this.duration) {
          this.start();
          time = 0;
        }

        this.update(time);

      }, this);

      return this;

    },

    stop: function() {

      this.alive = false;
      delete this.__tick;
      return this;

    }

  });

  (function() {

    _.each(Anitype.Instances, function(t) {

      if (_.isFunction(t.__tick)) {
        t.__tick();
      }

    });

    requestAnimationFrame(arguments.callee);

  })();

})();