const fs = require('fs');
const childProcess = require('child_process');
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
	output: 'Server-Intermediate',
	build: false,
	ico: 'dev/res/icon.ico'
}).then(function(err) {
	console.log("Changing icon");

	childProcess.execFile('dev/bin/ResourceHacker.exe', [
		'-open',
		'Server-Intermediate.exe',
		'-save',
		'Server.exe',
		'-action',
		'addoverwrite',
		'-res',
		'dev/res/icon.ico',
		'-mask',
		'ICONGROUP,MAINICON,'
	], function(err) {
		fs.unlinkSync('Server-Intermediate.exe');
	});
});