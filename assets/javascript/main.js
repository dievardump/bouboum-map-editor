/*!
 * Map Editor 
 * Main JavaScript File
 *
 * @TODO: refactoring to really use requirejs
 * @TODO: Spend more than 2 hours on that shit
 */
 require(
	[
		'assets/javascript/lib/dat.gui.min.js',
		'assets/javascript/editor/Editor.js',
		'assets/javascript/editor/Cursor.js'
	],
	function (GUI, Editor, Cursor) {

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

				full: function () {
					editor.full();
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
				},

				hideCursor: true,

				fnHideCursor: function (value) {
					var className = ''; 
					if (value) {
						className = 'hide-cursor';
					}
					elements.mouse.className = className;
				}
			};

			settings.fnHideCursor(true);

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
			var typeController = f2.add(settings, 'cursorType', cursorTypes).onChange(settings.fnCursorType);
			var widthController = f2.add(settings, 'cursorWidth').min(1).max(10).step(1).onChange(settings.fnCursorWidth);
			var heightController = f2.add(settings, 'cursorHeight').min(1).max(10).step(1).onChange(settings.fnCursorHeight);
			f2.add(settings, 'hideCursor').onChange(settings.fnHideCursor);

			var f3 = gui.addFolder('Remplissage');
			f3.add(settings, 'reset');
			f3.add(settings, 'full');
			f3.add(settings, 'random');
			var f4 = gui.addFolder('Import / Export');
			f4.add(settings, 'export');
			f4.add(settings, 'import');

			f1.open();
			f2.open();
			f3.open();
			f4.open();

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

			var mouseWheelEvent = (/Firefox/i.test(navigator.userAgent))? "DOMMouseScroll" : "mousewheel";

			var mouseWheelHandler = function (e) {
				e.preventDefault();
				var data = e.detail ? -e.detail : e.wheelDelta;
				data = data > 0 ? 1 : -1;

				if (e.altKey || e.shiftKey) {
					var width = +widthController.getValue();
					var height = +heightController.getValue();
					if ((data < 0 && width === 1 && height === 1) ||
						(data > 0 && width === 10 && height === 10)) {
						return;
					}

					if (e.altKey) {
						width += data;
						widthController.setValue(width);
					}

					if (e.shiftKey) {
						height += data;
						heightController.setValue(height);
					}
				}
				else {
					var value = (typeController.getValue()+data) % (cursors.length);
					if (value < 0) {
						value = cursors.length-1;
					}
					typeController.setValue(value);
				}
			}

			elements.mouse.addEventListener(mouseWheelEvent, mouseWheelHandler);

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

