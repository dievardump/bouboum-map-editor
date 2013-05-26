define(function () {
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
				this.grid = elements.grid;

				this.ctxs.map = this.map.getContext('2d');
				this.ctxs.background = this.background.getContext('2d');

				this.gridify();

				this.reset();

				return this;
			},

			gridify: function () {
				var ctx = this.grid.getContext('2d'),
					sizes = this.sizes,
					h = sizes.default.h,
					w = sizes.default.w,
					iterY = sizes.maps.h/h,
					iterX = sizes.maps.w/w;

				ctx.beginPath();
				for(j = 0; j<iterX; j++) {
					ctx.moveTo(j * w, 0);
					ctx.lineTo(j * w, sizes.maps.h);
				}


				for(i = 0; i<iterY; i++) {
					ctx.moveTo(0, i * h);
					ctx.lineTo(sizes.maps.w, i * h);
				}

				ctx.strokeStyle = 'rgba(255,255,255,1)';
				ctx.stroke();

				ctx.closePath();
				ctx.beginPath();
				var mid = Math.floor(iterX/2);
				ctx.moveTo(mid * w, 0);
				ctx.lineTo(mid * w, sizes.maps.h);
				mid++;
				ctx.moveTo(mid * w, 0);
				ctx.lineTo(mid * w, sizes.maps.h);

				mid = Math.floor(iterY/2);
				ctx.moveTo(0, mid * h);
				ctx.lineTo(sizes.maps.w, mid * h);

				ctx.strokeStyle = 'rgba(255,0, 0, 1)';
				ctx.stroke();
				ctx.closePath();

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
					var pattern = ctx.createPattern(bgd, 'repeat');
					ctx.clearRect(0, 0, sizes.maps.w, sizes.maps.h);
					ctx.fillStyle = pattern;
  					ctx.fillRect(0, 0, sizes.maps.w, sizes.maps.h);
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

			full: function () {
				var type = this.cursor.type;
				this.fill(function() { return type; });

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

	return Editor;
});