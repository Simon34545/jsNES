let nesroms = {}

let romStorage = localStorage.getItem('roms');

if (romStorage != null) {
	let romNames = romStorage.split('/');
	for (let i = 0; i < romNames.length - 1; i++) {
		nesroms[romNames[i]] = window.atob(localStorage.getItem(romNames[i])).split(',');
	}
} else {
	romStorage = '';
}

nesroms["Select a file"] = [0];