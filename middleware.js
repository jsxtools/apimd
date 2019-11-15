const fs = require('fs');
const parseAsApimd = require('./parse');
const {
	asString,
	create,
	has,
	isNullish,
	isObject,
	parseAsJson,
} = require('./util');

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

/** return a body as a string */
const getBody = (body, jsonReplacer, jsonSpace) => isObject(body)
	? JSON.stringify(body, jsonReplacer, jsonSpace)
: asString(body);

/** return an apimd collection from a string */
const readApimdFile = src => parseAsApimd(fs.readFileSync(src, 'utf8'));

/** return a function that creates and returns apimd middleware */
const createMiddleware = opts => {
	opts = create(defaultOpts, opts);

	let api = null;

	const middleware = (req, res, next) => {
		if (opts.live) {
			try {
				api = readApimdFile(opts.src);
			} catch (error) {
				// do nothing and continue
			}
		}

		const { headers, method, url } = Object(req);
		let { body } = Object(req);

		const hasMatchingApi = isObject(api) && has(api, url) && has(api[url], method);

		if (hasMatchingApi) {
			const hasResponse = api[url][method].some(entry => {
				const hasMatchingRequestHeaders = Object.entries(entry.request.headers).every(
					([ name, value ]) => name in headers && headers[name] === value
				);

				if (hasMatchingRequestHeaders) {
					const shouldValidateRequestBody = method === 'POST' && entry.request.body;

					if (shouldValidateRequestBody) {
						if (isNullish(body)) {
							body = '';

							req.on('data', chunk => {
								body += chunk.toString();
							});

							req.on('end', onPostEnd);
						} else {
							onPostEnd(body);
						}
					} else {
						onPass();
					}
				}

				return hasMatchingRequestHeaders;

				function onPostEnd() {
					try {
						body = parseAsJson(body);
					} catch (error) {
						// do nothing and continue
					}

					const shouldCompareRequestBodies = isObject(body) && isObject(entry.request.body);

					if (shouldCompareRequestBodies) {
						const hasMatchingRequestBody = Object.entries(entry.request.body).every(
							([ name, value]) => has(body, name) && body[name] === value
						);

						if (hasMatchingRequestBody) {
							onPass();
						} else {
							onFail();
						}
					} else if (body === entry.request.body) {
						onPass();
					} else {
						onFail();
					}
				}

				function onPass() {
					res.status(entry.response.status).set(entry.response.headers).end(
						getBody(entry.response.body, opts.jsonReplacer, opts.jsonSpace)
					);
				}
			});

			if (!hasResponse) {
				onFail();
			}
		} else {
			next();
		}

		function onFail() {
			res.status(opts.fallbackStatus).set(opts.fallbackHeaders).end(
				getBody(opts.fallbackBody, opts.jsonReplacer, opts.jsonSpace)
			);
		}
	};

	try {
		api = readApimdFile(opts.src);
	} catch (error) {
		// do nothing and continue
	}

	return middleware;
};

module.exports = createMiddleware;
