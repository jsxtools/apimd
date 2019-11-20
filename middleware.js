const fs = require('fs');
const parseAsApimd = require('./parse');
const { asString, create, isFunction, isNullish, isObject, parseAsJson } = require('./util');

/* constants
/* ========================================================================== */

const defaultOpts = {
	fallbackBody: create(),
	fallbackHeaders: create(),
	fallbackStatus: 401,
	jsonReplacer: null,
	jsonSpace: '  ',
	live: false,
	src: 'api.md',
};

/* middleware methods
/* ========================================================================== */

/** returns a body as a string */
const getBody = (body, jsonReplacer, jsonSpace) => isObject(body)
	? JSON.stringify(body, jsonReplacer, jsonSpace)
: asString(body);

/** returns an apimd collection from a string */
const readApimdFile = src => {
	try {
		return parseAsApimd(fs.readFileSync(src, 'utf8'));
	} catch (error) {
		return null;
	}
};

/** returns a function that creates and returns apimd middleware */
const createMiddleware = opts => {
	opts = create(defaultOpts, opts);

	let all = null;

	const middleware = (req, res, next) => {
		if (opts.live) {
			all = readApimdFile(opts.src);
		}

		if (!all) {
			next();

			return;
		}

		let { body, headers, method, on, url } = Object(req);

		const isPostWithoutBody = method === 'POST' && isNullish(body) && isFunction(on);

		if (isPostWithoutBody) {
			body = '';

			on.call(req, 'data', chunk => {
				body += chunk.toString();
			});

			on.call(req, 'end', () => {
				try {
					body = parseAsJson(body);
				} catch (error) {
					// do nothing and continue
				}

				onTest();
			});
		} else {
			onTest();
		}

		function onTest() {
			const hasEndpoint = all.someByURL(url);

			if (hasEndpoint) {
				const endpoint = all.findByRequest({ method, url, headers, body });

				if (endpoint) {
					res.status(endpoint.response.status).set(endpoint.response.headers).end(
						getBody(endpoint.response.body, opts.jsonReplacer, opts.jsonSpace)
					);
				} else {
					res.status(opts.fallbackStatus).set(opts.fallbackHeaders).end(
						getBody(opts.fallbackBody, opts.jsonReplacer, opts.jsonSpace)
					);
				}
			} else {
				next();
			}
		}
	};

	all = readApimdFile(opts.src);

	return middleware;
};

module.exports = createMiddleware;
