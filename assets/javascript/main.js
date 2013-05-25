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
		'assets/javascript/lib/ajax.js',
		'assets/javascript/editor/Editor.js',
		'assets/javascript/editor/Cursor.js'
	],
	function (GUI, XHR, Editor, Cursor) {

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
			grid: document.getElementById('grid'),
			cursor: document.getElementById('cursor'),
			mouse: document.getElementById('mousecheat'),
			impex: document.getElementById('impex'),
			code: document.getElementById('code'),
			load: document.getElementById('load'),
			close: document.getElementById('close'),
			sydo: document.getElementById('sydo')
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

		['map', 'background', 'grid', 'mouse'].forEach(function(name) {
			elements[name].width = sizes.maps.w;
			elements[name].height = sizes.maps.h;
		});

		function extend(target) {
            Array.prototype.slice.call(arguments, 1).forEach(function(source) {
                Object.getOwnPropertyNames(source).forEach(function (name) {
                    target[name] = source[name];
                });
            });
            return target;
        }

        function convertForSydoline(canvas, ctx, items) {

        	var sydo = elements.sydo,
        		deltaX = (sydo.width-sizes.maps.w)/2,
        		deltaY = (sydo.height-sizes.maps.h)/2,
        		colors = {
        			block: 'rgb(105, 119, 193)',
        			unbreakable: 'rgb(0, 0, 0)'
        		},
        		bWidth = sizes.default.w,
        		bHeight = sizes.default.h,
        		iterX = sizes.maps.w/bWidth,
        		iterY = sizes.maps.h/bHeight,
        		i = 0, j = 0,
        		item = 0;

        	canvas.width = sydo.width;
        	canvas.height = sydo.height;
        	ctx.drawImage(sydo, 0, 0);

        	for(i = 0; i < iterY; i++) {
        		for(j = 0; j < iterX; j++) {
        			item = items[i][j];
        			if (item === 0) {
        				ctx.fillStyle = colors.block;
        			}
        			else if (item === 1) {
        				ctx.fillStyle = colors.unbreakable;
        			}
        			else {
        				ctx.fillStyle = 'transparent';
        			}
        			ctx.fillRect(deltaX + (j*bWidth), deltaY+(i*bHeight), bWidth-1, bHeight-1);
        		}
        	}

        	return canvas;
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
				},

				imgur: function (sydo) {

					if (confirm('Vous allez uploader votre map sur le site imgur.com et récupérer un lien pour y accéder.\nVoulez-vous continuer ?')) {
						var canvas = document.createElement('canvas'),
							ctx = canvas.getContext('2d');
						if (sydo === true) {
							canvas = convertForSydoline(canvas, ctx, editor.items);

						} else {
							canvas.width = elements.map.width;
							canvas.height = elements.map.height;

							ctx.drawImage(elements.background, 0, 0);
							ctx.drawImage(elements.map, 0, 0);							
						}
						try {
					        var img = canvas.toDataURL('image/jpeg', 0.9).split(',')[1];
					    } catch(e) {
					        var img = canvas.toDataURL().split(',')[1];
					    }
					    
					    var date = (+new Date());
					    XHR.ajax({
					    	url: 'https://api.imgur.com/3/upload.json',
							type: 'POST',
							data: {
								type: 'base64',
								key: '08739464ca0076df069bb66ccb9d4b5883339c03',
								image: img
							},
							dataType: 'json',
							beforeSend: function (request) {
								request.setRequestHeader("Authorization", "Client-ID 40ec0a0788ce226");
							},
					        success: function (data) {
					        	console.log(data);
					        	if (data.success) {
					        		alert('Votre image est disponible ici: ' + data.data.link);
					        	}
					        }, 
					        error: function (data) {
					        	alert(error.message);
					        }
					    });
					}
				},

				convertForSydoline: function () {
					this.imgur(true);
				},

				showGrid: false,

				fnShowGrid: function (value) {
					elements.grid.style.display = value ? 'block' : 'none';
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
			f1.add(settings, 'showGrid').onChange(settings.fnShowGrid);

			var f2 = gui.addFolder('Cursor');
			var cursorTypeController = f2.add(settings, 'cursorType', cursorTypes).onChange(settings.fnCursorType);
			var widthController = f2.add(settings, 'cursorWidth').min(1).max(sizes.maps.w/sizes.default.w).step(1).onChange(settings.fnCursorWidth);
			var heightController = f2.add(settings, 'cursorHeight').min(1).max(sizes.maps.h/sizes.default.w).step(1).onChange(settings.fnCursorHeight);
			f2.add(settings, 'hideCursor').onChange(settings.fnHideCursor);

			var f3 = gui.addFolder('Remplissage');
			f3.add(settings, 'reset');
			f3.add(settings, 'full');
			f3.add(settings, 'random');

			var f4 = gui.addFolder('Import / Export');
			f4.add(settings, 'export');
			f4.add(settings, 'import');
			f4.add(settings, 'imgur');
			f4.add(settings, 'convertForSydoline');

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
				e.preventDefault();
				e.stopPropagation();
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
					var value = (cursorTypeController.getValue()+data) % (cursors.length);
					if (value < 0) {
						value = cursors.length-1;
					}
					cursorTypeController.setValue(value);
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
					elements.impex.style.display = 'none';
				}
			});

		};

		image.src = sprite;
	}
);

