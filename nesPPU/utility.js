let width = 256;
let height = 240;
let framerate = 60;

let cnvs = document.createElement('canvas');
document.body.appendChild(cnvs);

cnvs.style.backgroundColor = '#000';

let ctx = cnvs.getContext('2d');

// graphics

class Color {
	color = [0, 0, 0, 255];
	constructor(r = 0, g = 0, b = 0, a = 255) {
		this.color[0] = r;
		this.color[1] = g;
		this.color[2] = b;
		this.color[3] = a;
	}
	
	get r() {
		return this.color[0];
	}
	
	set r(r) {
		this.color[0] = r;
	}
	
	get g() {
		return this.color[1];
	}
	
	set g(g) {
		this.color[1] = g;
	}
	
	get b() {
		return this.color[2];
	}
	
	set b(b) {
		this.color[2] = b;
	}
	
	get a() {
		return this.color[3];
	}
	
	set a(a) {
		this.color[3] = a;
	}
}

let colors = {
	GREY: new Color(192, 192, 192), DARK_GREY: new Color(128, 128, 128), VERY_DARK_GREY: new Color(64, 64, 64),
	RED: new Color(255, 0, 0), DARK_RED: new Color(128, 0, 0), VERY_DARK_RED: new Color(64, 0, 0),
	YELLOW: new Color(255, 255, 0), DARK_YELLOW: new Color(128, 128, 0), VERY_DARK_YELLOW: new Color(64, 64, 0),
	GREEN: new Color(0, 255, 0), DARK_GREEN: new Color(0, 128, 0), VERY_DARK_GREEN: new Color(0, 64, 0),
	CYAN: new Color(0, 255, 255), DARK_CYAN: new Color(0, 128, 128), VERY_DARK_CYAN: new Color(0, 64, 64),
	BLUE: new Color(0, 0, 255), DARK_BLUE: new Color(0, 0, 128), VERY_DARK_BLUE: new Color(0, 0, 64),
	MAGENTA: new Color(255, 0, 255), DARK_MAGENTA: new Color(128, 0, 128), VERY_DARK_MAGENTA: new Color(64, 0, 64),
	WHITE: new Color(255, 255, 255), BLACK: new Color(0, 0, 0), BLANK: new Color(0, 0, 0, 0)
}

class Sprite {
	imgdata = null;
	
	constructor(width = 200, height = 50) {
		this.width = width;
		this.height = height;
		this.imgdata = new ImageData(width, height);
	}
	
	SetPixel(x, y, c) {
		let i = y * (this.width * 4) + x * 4;
		this.imgdata.data[i + 0] = c.r;
		this.imgdata.data[i + 1] = c.g;
		this.imgdata.data[i + 2] = c.b;
		this.imgdata.data[i + 3] = c.a;
	}
	
	GetPixel(x, y) {
		let i = y * (this.width * 4) + x * 4;
		let c = new Color();
		c.r = this.imgdata.data[i + 0];
		c.g = this.imgdata.data[i + 1];
		c.b = this.imgdata.data[i + 2];
		c.a = this.imgdata.data[i + 3];
		return c;
	}
}

function DrawSprite(x, y, sprite) {
	ctx.putImageData(sprite.imgdata, x, y);
}

function DrawString(x, y, text, c = colors.WHITE, scale = 1) {
	ctx.fillStyle = `rgba(${c.r}, ${c.g}, ${c.b}, ${c.a/255})`;
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.font = 7 * scale + 'px nes';
  ctx.fillText(text, x, y);
}

function DrawRect(x, y, w, h, c) {
	ctx.fillStyle = `rgba(${c.r}, ${c.g}, ${c.b}, ${c.a/255})`;
	ctx.fillRect(x, y, w, h);
}

function Clear(c) {
	DrawRect(0, 0, width, height, c);
}

// input

let heldKeys = {};
let pressedKeys = {};

document.addEventListener('keydown', function(e) {
	if (e.repeat) return;
	heldKeys[e.key] = true;
	pressedKeys[e.key] = true;
});

document.addEventListener('keydown', function(e) {
	heldKeys[e.key] = false;
});

// main

let frameInterval;

let waitStart = setInterval(function() {
	if (typeof(start) == 'function') {
		let result = start();
		clearInterval(waitStart);
		
		cnvs.width = width;
		cnvs.height = height;
		
		if (!result) {
			alert("Failed to start!");
			return;
		}
		
		frameInterval = setInterval(function() {
			if (typeof(update) == 'function') {
				update()
			}
			for (const key in pressedKeys) {
				pressedKeys[key] = false;
			}
		}, 1000/framerate);
	}
}, 1000/framerate);

function hex(n, d) {
	let s = '';
	for (let i = d - 1; i >= 0; i--, n >>=4) {
		s = ("0123456789ABCDEF")[n & 0xF] + s;
	}
	return s;
}

function uncomplement(val, bitwidth) {
    var isnegative = val & (1 << (bitwidth - 1));
    var boundary = (1 << bitwidth);
    var minval = -boundary;
    var mask = boundary - 1;
    return isnegative ? minval + (val & mask) : val;
}

Array.prototype.findNext = function(idx) {
	while (idx < this.length && idx >= 0) {
		if (this[idx] != undefined) {
			return idx;
		}
		idx++;
	}
	return this.length;
}

Array.prototype.findPrevious = function(idx) {
	while (idx < this.length && idx >= 0) {
		if (this[idx] != undefined) {
			return idx;
		}
		idx--;
	}
	return this.length;
}