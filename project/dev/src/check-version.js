const semver = require("semver");

if (!semver.satisfies(process.version, "v12.18.2"))
{
    console.log("Server requires node version v12.18.2");
    console.log(`Your version is ${process.version}`);
    process.exit(1);
}
else
{
    console.log("Your node version is correct.");
}