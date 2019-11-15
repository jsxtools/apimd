const { parseAsYaml } = require('parse-yaml');
const mdast = require('markdown-ast');
const path = require('path');

/** return an object with other objects assigned to it */
exports.assign = Object.assign;

/** return whether a value is an Array */
exports.isArray = Array.isArray;

/** return whether a value is a Function */
exports.isFunction = value => typeof value === 'function';

/** return whether a value is an Object */
exports.isObject = value => value !== null && typeof value === 'object';

/** return whether a value is nullish */
exports.isNullish = value => value === null || value === undefined;

/** return a value as a number */
exports.asNumber = value => Number(value) || 0;

/** return a value as a string */
exports.asString = value => value === null || value === undefined ? '' : String(value);

/** return a new prototype-less object conditionally assigned properties */
exports.create = (...values) => Object.assign(Object.create(null), ...values);

/** return whether an object contains a property */
exports.has = Function.call.bind(Object.hasOwnProperty);

/** return an object parsed from a Markdown string */
exports.parseAsMarkdown = mdast;

/** return an object parsed from a JSON string */
exports.parseAsJson = JSON.parse;

/** return an object parsed from a YAML string */
exports.parseAsYaml = parseAsYaml;

/** return an object of apimdConfig options from package.json */
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
