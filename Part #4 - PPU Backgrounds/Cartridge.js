class Cartridge {
	mirror = "HORIZONTAL";
	bImageValid = false;
	
	constructor(sFileName) {
		var xhr = new XMLHttpRequest();
		xhr.open('GET', 'https://simon34545.github.io/filehosting/' + sFileName, true);
		xhr.responseType = 'blob';
		window.cartTemp = this;
		
		xhr.onload = function(e) {
			if (this.status == 200) {
				var blob = this.response;
				var arrayBuffer;
				var fileReader = new FileReader();
				fileReader.onload = function(e) {
					var self = window.cartTemp;
					var results = [];
					var contents = e.target.result;
					var array = new Uint8Array(contents);
		
					for (var i = 0; i < array.length; i++) {
						results.push(array[i]);
					}
					var readidx = 0;
					
					var header = {};
					
					self.bImageValid = false;

					header.name = new Uint8Array([results[readidx++], results[readidx++], results[readidx++], results[readidx++]]);
					header.prg_rom_chunks = results[readidx++];
					header.chr_rom_chunks = results[readidx++];
					header.mapper1 = results[readidx++];
					header.mapper2 = results[readidx++];
					header.prg_ram_size = results[readidx++];
					header.tv_system1 = results[readidx++];
					header.tv_system2 = results[readidx++];
					header.unused = new Uint8Array([results[readidx++], results[readidx++], results[readidx++], results[readidx++], results[readidx++]]);
					
					if (header.mapper1 & 0x04) {
						readidx = 512;
					}
					
					self.nMapperID = (((header.mapper2 >> 4) << 4) & 0xFF) | (header.mapper1 >> 4);
					self.mirror = (header.mapper1 & 0x01) ? "VERTICAL" : "HORIZONTAL";
					
					var nFileType = 1;
					
					if (nFileType == 0) {
						
					}
					
					if (nFileType == 1) {
						self.nPRGBanks = header.prg_rom_chunks;
						self.vPRGMemory = new Uint8Array(self.nPRGBanks * 16384);
						for (var i = 0; i < self.nPRGBanks * 16384; i++) {
							self.vPRGMemory[i] = results[readidx + i];
						}
						
						readidx += self.nPRGBanks * 16384;
						
						self.nCHRBanks = header.chr_rom_chunks;
						if (self.nCHRBanks == 0) {
							self.vCHRMemory = new Uint8Array(8192);
						} else {
							self.vCHRMemory = new Uint8Array(self.nCHRBanks * 8192);
						}
						self.vCHRMemory = new Uint8Array(self.nCHRBanks * 8192);
						for (var i = 0; i < self.vCHRMemory.length; i++) {
							self.vCHRMemory[i] = results[readidx + i];
						}
					}
					
					if (nFileType == 2) {
						
					}
					
					// Load appropriate mapper
					switch (self.nMapperID) {
						case  0: self.pMapper = new Mapper_000(self.nPRGBanks, self.nCHRBanks); break;
						//case  2: self.pMapper = new Mapper_002(self.nPRGBanks, self.nCHRBanks); break;
						//case  3: self.pMapper = new Mapper_003(self.nPRGBanks, self.nCHRBanks); break;
						//case 66: self.pMapper = new Mapper_066(self.nPRGBanks, self.nCHRBanks); break;
					}
					
					self.bImageValid = true;
					console.log(readidx, header);
				};
				fileReader.readAsArrayBuffer(blob);
			}
		};

		xhr.send();
	}
	
	ImageValid() {
		return this.bImageValid;
	}
	
	vPRGMemory = new Uint8Array();
	vCHRMemory = new Uint8Array();
	
	nMapperID = 0;
	nPRGBanks = 0;
	nCHRBanks = 0;
	
	pMapper = null;
	
	cpuRead(addr, data) {
		var mapped_addr = this.pMapper.cpuMapRead(addr, 0);
		if (mapped_addr[1]) {
			data = this.vPRGMemory[mapped_addr[0]];
			return [data, true];
		} else {
			return [data, false];
		}
	}
	cpuWrite(addr, data) {
		var mapped_addr = this.pMapper.cpuMapRead(addr, 0);
		if (mapped_addr[1]) {
			this.vPRGMemory[mapped_addr[0]] = data;
			return true;
		} else {
			return false;
		}
	}
	
	ppuRead(addr, data) {
		var mapped_addr = this.pMapper.ppuMapRead(addr, 0);
		if (mapped_addr[1]) {
			data = this.vCHRMemory[mapped_addr[0]];
			return [data, true];
		} else {
			return [data, false];
		}
	}
	ppuWrite(addr, data) {
		var mapped_addr = this.pMapper.ppuMapRead(addr, 0);
		if (mapped_addr[1]) {
			this.vCHRMemory[mapped_addr[0]] = data;
			return true;
		} else {
			return false;
		}
	}
	
	reset() {
		if (this.pMapper != null) {
			this.pMapper.reset();
		}
	}
}