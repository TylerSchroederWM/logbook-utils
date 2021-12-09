var argv = require("minimist")(process.argv.slice(2));
var clientFactory = require("ssb-client");
var config = require("ssb-config");

var DEBUG = !false;

var LOCATION_FLAGS = ["location", "loc", "l"];
var EXPERIMENT_TYPE_FLAGS = ["type", "t", "experiment", "e"];
var CATEGORY_FLAGS = ["category", "cat", "c"];

function main(client, passThrough, cb) {
	var location = getFlagOrDefault(LOCATION_FLAGS, "Unknown");
	var experimentType = getFlagOrDefault(EXPERIMENT_TYPE_FLAGS, "Unknown");
	var category = getFlagOrDefault(CATEGORY_FLAGS, "Unknown");
	var checkboxes = getCheckboxes();
	
	client.publish({
		type: "post", // "logbook"?
		text: argv["_"].join(" "),
		location: location,
		experimentType: experimentType,
		category: category,
		checkboxes: checkboxes
	}, function(err, msg) {
		if(err) {
			console.log("[ERROR] Couldn't send message: " + err);
			process.exit(1);
		}
		else {
			console.log("Sent message:\n" + JSON.stringify(msg));
			process.exit(0);
		}
	});
}

function getFlagOrDefault(flags, d) {
	for(let flag of flags) {
		if(argv[flag]) {
			arg = argv[flag];
			delete argv[flag]; // makes checkbox searching faster later
			
			return arg;
		}
	}
	return d;
}

function getCheckboxes() {
	ret = {}
	console.log(argv);
	for(let [key, val] of Object.entries(argv)) {
		if(key != "_") {
			ret[key] = true;
		}
	}
	
	return ret;
}

function getConfig() {
	return {
		host: config.host || "localhost",
		port: config.port || 8008
	}
}

function debug(message) {
	if(DEBUG) {
		var timestamp = new Date();
		console.log("[channels-lib] [" + timestamp.toISOString() + "] " +  message);
	}
}

clientFactory(getConfig(), function(err, client) {
	if(err) {
		console.log("[ERROR] Failed to open ssb-client: " + err);
	}

	if(argv["delete"] || argv["del"]) {
		argv.d = true;
	}
	main(client, null, () => {});
});
