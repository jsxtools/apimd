const { parse: parseAsJson } = require('json-6');
const { parseAsYaml } = require('parse-yaml');
const EsmModule = require('esm')(module, { await: true })('module');
const fetch = require('node-fetch');
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

/** returns whether a value is a Promise */
exports.isPromise = value => exports.isObject(value) && typeof value.then === 'function';

/** returns whether a value is a Regular Expression */
exports.isRegExp = value => exports.isObject(value) && typeof value.test === 'function';

/** returns whether a value is nullish */
exports.isNullish = value => value === null || value === undefined;

/** returns a value as a number */
exports.asNumber = value => Number(value) || 0;

/** returns a value as a string */
exports.asString = value =>
	value === null || value === undefined ? '' : String(value);

/** returns a new prototype-less object conditionally assigned properties */
exports.create = (...values) => Object.assign(Object.create(null), ...values);

/** returns whether an object contains a property */
exports.has = Function.call.bind(Object.hasOwnProperty);

/** returns an object parsed from an esm string */
exports.parseAsEsm = string => {
	const esm = new EsmModule();

	return function (req, params) {
		try {
			const hasGlobalFetch = Reflect.has(global, 'fetch');
			const globalFetch = Reflect.get(global, 'fetch');
			const jsMatch = /^((c|m)?js|es(6|m)?|javascript|jsm?)(\s|$)/i;
			const jsonMatch = /^json(5|c|ld)?(\s|$)/i;
			const yamlMatch = /^ya?ml(\s|$)/i;

			Reflect.set(global, 'fetch', (input, ...init) => fetch(input, ...init).then(
				response => typeof Object(init[0]).type === 'string' ?
					response.text().then(
						text => jsMatch.test(init[0].type)
							? exports.parseAsEsm(text)
						: jsonMatch.test(init[0].type)
							? exports.parseAsJson(text)
						: yamlMatch.test(init[0].type)
							? exports.parseAsYaml(text)
						: text
					)
				: response
			));

			if (exports.isObject(req)) {
				Reflect.set(global, 'request', req);
			}

			if (exports.isObject(params)) {
				Reflect.set(global, 'params', params);
			}

			esm._compile(string, __filename);
			esm.loaded = true;

			if (exports.isObject(req)) {
				Reflect.deleteProperty(global, 'request');
			}

			if (exports.isObject(params)) {
				Reflect.deleteProperty(global, 'params');
			}

			Reflect.set(global, 'fetch', globalFetch);

			if (!hasGlobalFetch) {
				Reflect.deleteProperty(global, 'fetch');
			}
		} catch (error) {
			// do nothing and continue
		}

		return Promise.resolve(esm.exports.default || esm.exports);
	}
};

/** returns an object parsed from a JSON string */
exports.parseAsJson = parseAsJson;

/** returns an object parsed from a Markdown string */
exports.parseAsMarkdown = mdast;

/** returns an object parsed from a YAML string */
exports.parseAsYaml = parseAsYaml;

/** returns an object of apimdConfig options from package.json */
exports.getPackageOpts = pathToPackageJson => {
	pathToPackageJson =
		pathToPackageJson || path.join(process.cwd(), 'package.json');

	let pkg = Object.create(null);

	try {
		pkg = require(pathToPackageJson);
	} catch (error) {
		// do nothing and continue
	}

	const apimdConfig = Object.assign(
		Object.create(null),
		pkg.apimd,
		pkg.apimdConfig
	);

	return apimdConfig;
};
