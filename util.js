const { parseAsYaml } = require('parse-yaml');
const mdast = require('markdown-ast');
const path = require('path');

/** returns an object with other objects assigned to it */
exports.assign = Object.assign;

/** returns whether a value is another value */
exports.is = Object.is;

/** returns whether a value is an Array */
exports.isArray = Array.isArray;

/** returns whether a value is a Function */
exports.isFunction = value => typeof value === 'function';

/** returns whether a value is an Object */
exports.isObject = value => value !== null && typeof value === 'object';

/** returns whether a value is nullish */
exports.isNullish = value => value === null || value === undefined;

/** returns a value as a number */
exports.asNumber = value => Number(value) || 0;

/** returns a value as a string */
exports.asString = value => value === null || value === undefined ? '' : String(value);

/** returns a new prototype-less object conditionally assigned properties */
exports.create = (...values) => Object.assign(Object.create(null), ...values);

/** returns whether an object contains a property */
exports.has = Function.call.bind(Object.hasOwnProperty);

/** returns an object parsed from a Markdown string */
exports.parseAsMarkdown = mdast;

/** returns an object parsed from a JSON string */
exports.parseAsJson = JSON.parse;

/** returns an object parsed from a YAML string */
exports.parseAsYaml = parseAsYaml;

/** returns an object of apimdConfig options from package.json */
exports.getPackageOpts = pathToPackageJson => {
	pathToPackageJson = pathToPackageJson || path.join(process.cwd(), 'package.json');

	let pkg = Object.create(null);

	try {
		pkg = require(pathToPackageJson);
	} catch (error) {
		// do nothing and continue
	}

	const apimdConfig = Object.assign(Object.create(null), pkg.apimd, pkg.apimdConfig);

	return apimdConfig;
};
