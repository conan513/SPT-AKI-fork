const fs = require('fs');
const childProcess = require('child_process');
const UPX = require('upx')('best')
const { compile } = require('nexe');

// compile the application
console.log("Building server");

if (fs.existsSync("Server.exe"))
{
	console.log("Old server build detected, removing the file");
	fs.unlinkSync('Server.exe');
}

compile({
	input: 'core/main.js',
	output: 'Server-Uncompressed',
	build: false,
	ico: 'dev/res/icon.ico'
}).then(function(err) {
	console.log("Changing icon");

	childProcess.execFile('dev/bin/ResourceHacker.exe', [
		'-open',
		'Server-Uncompressed.exe',
		'-save',
		'Server-Icon.exe',
		'-action',
		'addoverwrite',
		'-res',
		'dev/res/icon.ico',
		'-mask',
		'ICONGROUP,MAINICON,'
	], function(err) {
		fs.unlinkSync('Server-Uncompressed.exe');

		console.log("Compress executable");

		UPX('Server-Icon.exe')
		.output('Server.exe')
		.start().then(function(stats) {
			console.log(stats);
			fs.unlinkSync('Server-Icon.exe');			
		}).catch(function (err) {
			console.log(err);
		});
	});
});