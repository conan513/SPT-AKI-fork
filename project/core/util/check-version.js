const semver = require("semver");
if (!semver.satisfies(process.version, "v14.5.0"))
{
    console.log("Server requires node version v14.5.0");
    console.log(`Your version is ${process.version}`);
    process.exit(1);
}
else
{
    console.log("Your node version is correct.");
}