define(function() {

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

	return Cursor;
});