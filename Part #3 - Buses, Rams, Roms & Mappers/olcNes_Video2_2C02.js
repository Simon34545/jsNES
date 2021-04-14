var nes = new Bus();
var scr = document.getElementById('hex');
var inf = document.getElementById('inf');
var ctx = document.getElementById('scr').getContext('2d');


//startup

// Load the cartridge
var cart = new Cartridge('nestest.nes');

var bEmulationRun = false;
var fResidualTime = 0.0;

// Insert into NES
nes.insertCartridge(cart);

// Wait for cartridge mapper to load
function wait() {
    if (cart.pMapper == undefined) {
       window.setTimeout(wait, 16); /* this checks the flag every 100 milliseconds*/
    } else {
		// Reset NES
		nes.reset();
    }
}
wait();

//end startup

function draw() {
	/*var textToShow = '';
	
	for (var i = 0x0000; i <= 0x00ff; i++ ) {
		textToShow += (i % 16 == 0 && i != 0 ? '\n' + ('$' + ((i - i % 16).toString(16)).padStart(4, '0') + ': ') : (i % 16 == 0 ? ('$' + ((i - i % 16).toString(16)).padStart(4, '0') + ': ') : '')) + (nes.ram[i].toString(16).length < 2 ? '0' + nes.ram[i].toString(16).toUpperCase() : nes.ram[i].toString(16).toUpperCase()) + ' '
	}
	
	textToShow += "\n\n"
	
	for (var i = 0x8000; i <= 0x80FF; i++ ) {
		textToShow += (i % 16 == 0 ? '\n' + ('$' + ((i - i % 16).toString(16)).padStart(4, '0') + ': ') : '') + (nes.ram[i].toString(16).length < 2 ? '0' + nes.ram[i].toString(16).toUpperCase() : nes.ram[i].toString(16).toUpperCase()) + ' '
	}
	
	scr.innerText = textToShow;*/
	
	for (var x = 0; x < 256; x++) {
		for (var y = 0; y < 240; y++) {
			var idx = y * 256 + x;
			ctx.fillStyle = `rgb(${nes.ppu.sprScreen[idx][0]}, ${nes.ppu.sprScreen[idx][1]}, ${nes.ppu.sprScreen[idx][2]})`;
			ctx.fillRect(x, y, 1, 1);
		}
	}
	
	inf.innerHTML = `Status: <span style="color: #${nes.cpu.GetFlag(nes.cpu.FLAGS6502.N) ? '0f0' : 'f00'}">N</span> <span style="color: #${nes.cpu.GetFlag(nes.cpu.FLAGS6502.V) ? '0f0' : 'f00'}">V</span> <span>-</span> <span style="color: #${nes.cpu.GetFlag(nes.cpu.FLAGS6502.B) ? '0f0' : 'f00'}">B</span> <span style="color: #${nes.cpu.GetFlag(nes.cpu.FLAGS6502.D) ? '0f0' : 'f00'}">D</span> <span style="color: #${nes.cpu.GetFlag(nes.cpu.FLAGS6502.I) ? '0f0' : 'f00'}">I</span> <span style="color: #${nes.cpu.GetFlag(nes.cpu.FLAGS6502.Z) ? '0f0' : 'f00'}">Z</span> <span style="color: #${nes.cpu.GetFlag(nes.cpu.FLAGS6502.C) ? '0f0' : 'f00'}">C</span> \nPC: $${((nes.cpu.pc).toString(16)).padStart(4, '0')}\nA: $${(nes.cpu.a.toString(16).length < 2 ? '0' + nes.cpu.a.toString(16).toUpperCase() : nes.cpu.a.toString(16).toUpperCase()) + '  [' + nes.cpu.a + ']'}\nX: $${(nes.cpu.x.toString(16).length < 2 ? '0' + nes.cpu.x.toString(16).toUpperCase() : nes.cpu.x.toString(16).toUpperCase()) + '  [' + nes.cpu.x + ']'}\nY: $${(nes.cpu.y.toString(16).length < 2 ? '0' + nes.cpu.y.toString(16).toUpperCase() : nes.cpu.y.toString(16).toUpperCase()) + '  [' + nes.cpu.y + ']'}\nStack P: $${((nes.cpu.stkp).toString(16)).padStart(4, '0')}\n\n<span style="color: #0ff">${nes.cpu.debugString}</span>\n\n\n\n\n\n\n\n\n`//\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n`
}

draw();

function handleCycles() {
	if (bEmulationRun == false) {
		while (!nes.cpu.complete()) {
			nes.clock();
		}
		
		while (nes.cpu.complete()) {
			nes.clock();
		}
		
		draw();
	}
}

function handleFrame(fromKeyboard) {
	if (bEmulationRun == true) {
		while (!nes.ppu.frame_complete) {
			nes.clock();
		}
		
		/*while (!nes.cpu.complete()) {
			nes.clock();
		}*/
		
		nes.ppu.frame_complete = false;
		
		draw();
	} else if (fromKeyboard == true) {
		while (!nes.ppu.frame_complete) {
			nes.clock();
		}
		
		while (!nes.cpu.complete()) {
			nes.clock();
		}
		
		nes.ppu.frame_complete = false;
		
		draw();
	}
}

document.addEventListener("keyup", function(e) {
	switch(e.key.toLowerCase()) {
		case 'c':
			handleCycles();
			break;
		case 'f':
			handleFrame(true);
			break;
		case 'r':
			nes.cpu.reset();
			break;
		case ' ':
			bEmulationRun = !bEmulationRun;
			break;
	}
});

setInterval(handleFrame.bind(null, false), 1/60)