/*!
 * Map Editor 
 * Main JavaScript File
 *
 * @TODO: refactoring to really use requirejs
 * @TODO: Spend more than 2 hours on that shit
 */
 require(
	['assets/javascript/lib/dat.gui.min.js'],
	function (GUI) {

		var canvasCheck = document.createElement('canvas');

		if (!canvasCheck.getContext || !JSON || !JSON.stringify || !JSON.parse) {
			alert("Hey mec, faut changer de navigateur là !");
			return;
		}

		var sizes = {
			'default': { w: 20, h: 20 },
			maps: { w: 780, h: 360 }
		},
		maps = {
			types: [
				{
					name: 'Caverne',
					block: { x: 1, y: 1 },
					unbreakable: { x: 26, y: 1 },
					background: { x: 52 , y: 1, w: 40, h: 40 }
				},
				{
					name: 'Foret',
					block: { x: 1, y: 24 },
					unbreakable: { x: 26, y: 24 },
					background: { x: 52 , y: 1, w: 40, h: 40 }
				},
				{
					name: 'Marais',
					block: { x: 1, y: 47 },
					unbreakable: { x: 26, y: 47 }, 
					background: { x: 52 , y: 44, w: 40, h: 40 }
				}
			]
		},
		sprite = 'assets/img/sprite.png',
		sprites = ['block', 'unbreakable', 'background'],
		elements = {
			map: document.getElementById('map'),
			background: document.getElementById('background'),
			cursor: document.getElementById('cursor'),
			mouse: document.getElementById('mousecheat'),
			impex: document.getElementById('impex'),
			code: document.getElementById('code'),
			load: document.getElementById('load'),
			close: document.getElementById('close')
		},
		cursors = [
			{
				name: 'Bloc'
			},
			{
				name: 'Incassable'
			},
			{
				name: 'Gomme'
			}
		];

		elements.map.width = elements.background.width =  elements.mouse.width = sizes.maps.w;
		elements.map.height = elements.background.height = elements.mouse.height = sizes.maps.h;

		function extend(target) {
            Array.prototype.slice.call(arguments, 1).forEach(function(source) {
                Object.getOwnPropertyNames(source).forEach(function (name) {
                    target[name] = source[name];
                });
            });
            return target;
        }

        function findPos(element) {
			var curleft = 0,
				curtop = 0;
			if (element.offsetParent) {
				do {
					curleft += element.offsetLeft;
					curtop += element.offsetTop;
					element = element.offsetParent;
				} while (element);
			}
			return { x: curleft, y: curtop };
        }

		var Editor = {
			sizes: null,
			sprite: null,
			type: 0,
			ghosts: {
				canvas: {},
				ctx: {}
			},
			ctxs: {
				map: null,
				background: null
			},

			items: [],


			init: function (elements, options) {
				this.sprite = options.sprite;
				this.sprites = options.sprites;
				this.types = options.types;
				this.sizes = options.sizes;
				this.cursor = options.cursor;

				this.background = elements.background;
				this.map = elements.map;

				this.ctxs.map = this.map.getContext('2d');
				this.ctxs.background = this.background.getContext('2d');



				this.reset();

				return this;
			},

			setType: function (type) {
				var model = this.types[type],
					ghosts = this.ghosts,
					sprites = this.sprites,
					sizes = this.sizes,
					i = 0,
					sprite = null,
					canvas = null,
					ctx = null,
					size = sprites.length,
					sizer = null;

				this.type = type;

				for(i = 0; i < size; i++) {
					sprite = sprites[i];
					ghosts.canvas[sprite] = null;
					ghosts.ctx[sprite] = null;
					canvas = document.createElement('canvas');

					if (model[sprite].w) {
						sizer = model[sprite];
					} else {
						sizer = sizes.default;
					}

					canvas.width = sizer.w;
					canvas.height = sizer.h;

					ghosts.canvas[sprite] = canvas;
					ctx = canvas.getContext('2d');
					ghosts.ctx[sprite] = ctx;
					ctx.drawImage(this.sprite, model[sprite].x, model[sprite].y, sizer.w, sizer.h, 0, 0, sizer.w, sizer.h);
				}

				this.draw();

				this.cursor.setGhosts(ghosts);

				return this;
			},



			draw: function () {
				var items = this.items,
					sizes = this.sizes,
					model = this.types[this.type],
					w = model.background.w,
					h = model.background.h,
					iterY = sizes.maps.h/h,
					iterX = sizes.maps.w/w,
					i= 0, j = 0,
					ctx = this.ctxs.background,
					bgd = this.ghosts.canvas.background,
					block = this.ghosts.canvas.block,
					ub = this.ghosts.canvas.unbreakable,
					item = null;

				if (arguments.length === 0) {
					// fill the background
					ctx.clearRect(0, 0, sizes.maps.w, sizes.maps.h);
					for(i = 0; i<iterY; i++) {
						for(j = 0; j<iterX; j++) {
							ctx.drawImage(bgd, 0, 0, w, h, j * w,  i * h, w, h);
						}
					}
				}

				// fill the items
				ctx = this.ctxs.map;
				if (arguments.length === 0) {
					h = sizes.default.h;
					w = sizes.default.w;
					iterY = (sizes.maps.h/h);
					iterX = sizes.maps.w/w;
					x = 0;
					y = 0;
					clearW = sizes.maps.w;
					clearH = sizes.maps.h;
				} else {
					h = sizes.default.h;
					w = sizes.default.w;
					x = arguments[0];
					y = arguments[1];
					clearW = arguments[2]*w;
					clearH = arguments[3]*h;

					iterY = y/h+arguments[3];
					iterX = x/w+arguments[2];
				}
				ctx.clearRect(x, y, clearW, clearH);
				for(i = y/h; i<iterY; i++) {
					for(j = x/w; j<iterX; j++) {
						if (typeof this.items[i] !== 'undefined' 
						&& typeof this.items[i][j]  !== 'undefined') {
							item = items[i][j];
							if (item === 0) {
								ctx.drawImage(block, 0, 0, w, h, j * w,  i * h, w, h);
							} else if (item === 1) {
								ctx.drawImage(ub, 0, 0, w, h, j * w,  i * h, w, h);
							}
						}
					}
				}

				return this;
			},

			fill: function (fn) {
				var items = this.items,
					sizes = this.sizes,
					iterY = sizes.maps.h/sizes.default.h,
					iterX = sizes.maps.w/sizes.default.w;

				for(var i = 0; i<iterY; i++) {
					if (typeof items[i] === 'undefined') {
						items[i] = new Array(iterX);
					}
					for(var j = 0; j<iterX; j++) {
						items[i][j] = fn();
					}
				}

				return this;
			},

			reset: function () {
				this.fill(function() { return 2; });

				return this;
			},

			random: function () {
				this.fill(function() { return Math.round(Math.random()*2); });

				return this;
			},

			setBlocs: function(blocs, type) {
				var that = this;
				blocs.forEach(function (item) {
					that.setBloc(item.x, item.y, type);
				});
			},

			setBloc: function (x, y, type) {
				if (typeof this.items[y] !== 'undefined' 
						&& typeof this.items[y][x]  !== 'undefined') {
					this.items[y][x] = type;
				}
			}
		};

		var Cursor = {
			width: 1,
			height: 1,
			type: 0,
			ghosts: null,
			pos: {
				x: 0,
				y: 0
			},
			size: {
				w: 20, 
				h: 20
			},
			visible: false,
			offset: null,

			init: function (elements, options) {

				this.canvas = elements.cursor;
				this.ctx = elements.cursor.getContext('2d');

				this.background = elements.background;
				this.offset = findPos(this.background);

				this.size = options.size;
				this.types = options.types;

				this.resize(); 

				return this;
			},

			resize: function () {
				this.canvas.width = this.width * this.size.w;
				this.canvas.height = this.height * this.size.h;

				this.draw();
				return this;	
			},

			setGhosts: function (ghosts) {
				this.ghosts = ghosts;
				this.draw();

				return this;
			},

			position: function (x, y) {
				x -= this.offset.x;
				y -= this.offset.y;
				
				x = Math.floor(x/this.size.w) * this.size.w;
				y = Math.floor(y/this.size.h) * this.size.h;

				this.canvas.style.left = x + 'px';
				this.canvas.style.top = y + 'px';
				this.pos.x = x;
				this.pos.y = y;

				if (this.type === 2) {
					this.draw();
				}
			},

			draw: function () {
				if (this.ghosts !== null) {
					var type = this.type,
						size = this.size,
						w = this.canvas.width,
						h = this.canvas.height;

					if (type === 2) {
						if ((this.pos.x + w) >= this.background.width) {
							w = this.background.width - this.pos.x;
						}

						if ((this.pos.y + h) >= this.background.height) {
							h = this.background.height - this.pos.y;
						}

						if (w > 0 && h > 0) {
							this.ctx.drawImage(
								this.background,
								this.pos.x,	this.pos.y,
								w, h, 0, 0, w, h
							);
						}
					} else {
						var width = this.width,
							height = this.height,
							ghost = this.ghosts.canvas[this.types[type]],
							i = 0,
							j = 0;
							w = size.w;
							h = size.h;
						for(i = 0; i < height; i++) {
							for(j = 0; j < width; j++) {
								this.ctx.drawImage(ghost, 0, 0, w, h, j * w, i * h, w, h);
							}
						}

					}
				}

				return this;
			},

			setType: function (type) {
				this.type = +type;
				this.draw();
			},

			setVisible: function (bool) {
				this.visible = bool;
				this.canvas.style.display = bool ? 'block' : '';
			}
		};

		var image = new Image();
		image.onload = function () {

			var editor = extend({}, Editor);
			var cursor =  extend({}, Cursor).init(elements, {
				size: sizes.default,
				types: sprites
			});
			var typeController = null;

			//EDITION
			var settings = {
				type: 0,

				cursorWidth: 1,
				cursorHeight: 1,
				cursorType: 0,

				fnCursorType: function (value) {
					cursor.setType(value);
				},

				fnCursorWidth: function (value) {
					cursor.width = value;
					cursor.resize();
				},

				fnCursorHeight: function (value) {
					cursor.height = value;
					cursor.resize();
				},

				reset: function () {
					editor.reset();
					editor.draw();
				},

				random: function () {
					editor.random();
					editor.draw();
				},

				export: function () {
					var exp = {};

					exp.items = editor.items;
					exp.type = settings.type;

					elements.code.value = JSON.stringify(exp);
					elements.load.style.display = 'none';
					elements.impex.style.display = 'block';
				},

				'import': function () {
					elements.code.value = '';
					elements.load.style.display = 'block';
					elements.impex.style.display = 'block';
				},

				setType: function (value) {
					editor.setType(value);
				}
			};

			var types = {};
			maps.types.forEach(function (item, index) {
				types[item.name] = index;
			});

			var cursorTypes = {};
			cursors.forEach(function (item, index) {
				cursorTypes[item.name] = index;
			});
			
			// Dat GUI main
			var gui = new dat.GUI({ autoplace: false});
			document.getElementById('options').appendChild(gui.domElement);

			var f1 = gui.addFolder('Map Type');
			typeController = f1.add(settings, 'type', types).onChange(settings.setType);
			var f2 = gui.addFolder('Cursor');
			f2.add(settings, 'cursorType', cursorTypes).onChange(settings.fnCursorType);
			f2.add(settings, 'cursorWidth').min(1).max(10).step(1).onChange(settings.fnCursorWidth);
			f2.add(settings, 'cursorHeight').min(1).max(10).step(1).onChange(settings.fnCursorHeight);

			var f3 = gui.addFolder('Controls');
			f3.add(settings, 'reset');
			f3.add(settings, 'random');
			f3.add(settings, 'export');
			f3.add(settings, 'import');


			f1.open();
			f2.open();
			f3.open();

			
			var options = {
				sprite: this,
				sprites: sprites,
				types: maps.types,
				sizes: sizes,
				cursor: cursor
			};

			editor.init(elements, options)
				.random()
				.setType(0);

			var isClicked = false;

			function clickHandler() {
				var blockSize = cursor.size,
					pos = { x: cursor.pos.x/blockSize.w , y: cursor.pos.y/blockSize.h },
					size = { w: cursor.width, h: cursor.height },
					i = 0, j = 0,
					items = [],
					type = cursor.type;

				for(i = 0; i < size.h; i++) {
					for(j = 0; j < size.w; j++) {
						items.push({x: pos.x + j, y: pos.y + i });
					}
				}

				editor.setBlocs(items, type);
				editor.draw(cursor.pos.x, cursor.pos.y, size.w, size.h);
			}

			function position (e) {
				cursor.setVisible(true);
				cursor.position(e.clientX, e.clientY);
				if (isClicked) {
					clickHandler();
				}
			}

			elements.mouse.addEventListener('mousemove', position);

			elements.mouse.addEventListener('mouseout', function (e) {
				cursor.setVisible(false);
			}, true);

			elements.mouse.addEventListener('mousedown', function () {
				isClicked = true;
				clickHandler();
			});
			document.body.addEventListener('mouseup', function () {
				isClicked = false;
			});


			elements.close.addEventListener('click', function (e) {
				e.preventDefault();
				elements.impex.style.display = 'none';
			});

			elements.load.addEventListener('click', function (e) {
				e.preventDefault();
				var data = elements.code.value,
					parsed = JSON.parse(data);
				if (parsed) {
					editor.items = parsed.items;
					typeController.setValue(parsed.type);
				}
			});

		};

		image.src = sprite;
	}
);

