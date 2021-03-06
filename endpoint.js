const { assign, create, has, is, isArray, isNullish, asNumber, isRegExp, asString } = require('./util');

class Endpoints extends Array {
	add(opts) {
		const endpoint = opts instanceof Endpoint ? opts : new Endpoint(opts);

		this.push(endpoint);

		return endpoint;
	}

	clone(endpoint) {
		return this.add(endpoint.clone());
	}

	cloneOfURL(endpoint) {
		return this.add(endpoint.cloneOfURL());
	}

	findByRequest(request) {
		return this.find(endpoint => endpoint.matchesRequest(request)) || null;
	}

	someByRequest(request) {
		return this.some(endpoint => endpoint.matchesRequest(request));
	}

	someByURL(url) {
		return this.some(endpoint => endpoint.matchesURL(url));
	}

	toJSON() {
		return Object(this);
	}
}

class Endpoint {
	constructor(opts) {
		opts = create(opts);

		const req = create(opts.request);
		const res = create(opts.response);

		assign(this, {
			request: create({
				method: isNullish(req.method) ? null : String(req.method).toUpperCase(),
				url: isNullish(req.url) ? null : isRegExp(req.url) ? req.url : String(req.url),
				urlParams: isArray(req.urlParams) ? req.urlParams : [],
				headers: create(req.headers),
				body: isNullish(req.body) ? null : req.body,
			}),
			response: create({
				status: asNumber(res.status) || 200,
				headers: create({
					'Content-Type': 'application/json; charset=utf-8'
				}, res.headers),
				body: has(res, 'body') ? res.body : create(),
			}),
		});
	}

	clone() {
		return new Endpoint(this);
	}

	cloneOfURL() {
		return new Endpoint(
			create(
				this,
				{
					request: create({
						url: this.request.url
					}),
					response: create()
				}
			)
		);
	}

	matchesRequest(request) {
		const selfReq = create(this.request);
		const testReq = create(request);

		// match the endpoint request method
		const matchesMethod = (
			isNullish(testReq.method) ||
			isNullish(selfReq.method) ||
			is(
				asString(testReq.method).toUpperCase(),
				asString(selfReq.method).toUpperCase()
			)
		);

		if (!matchesMethod) {
			return false;
		}

		// match the endpoint request url
		const matchesUrl = (
			isNullish(testReq.url) ||
			isNullish(selfReq.url) ||
			(
				isRegExp(selfReq.url)
					? selfReq.url.test(testReq.url)
				: is(
					asString(testReq.url),
					asString(selfReq.url)
				)
			)
		);

		if (!matchesUrl) {
			return false;
		}

		// match the endpoint request headers
		const selfReqHeaders = create(selfReq.headers);
		const testReqHeaders = create(testReq.headers);
		const matchesHeaders = Object.entries(selfReqHeaders).every(
			([ name, value ]) => (
				has(testReqHeaders, name.toLowerCase()) &&
				is(
					asString(testReqHeaders[name.toLowerCase()]),
					asString(value)
				)
			)
		);

		if (!matchesHeaders) {
			return false;
		}

		// match the endpoint request body
		const selfReqBody = create(selfReq.body);
		const testReqBody = create(testReq.body);
		const matchesBody = Object.entries(selfReqBody).every(
			([ name, value ]) => (
				has(testReqBody, name) &&
				is(
					asString(testReqBody[name]),
					asString(value)
				)
			)
		);

		if (!matchesBody) {
			return false;
		}

		return true;
	}

	matchesURL(testURL) {
		const thisURL = this.request.url;

		return isRegExp(thisURL)
			? thisURL.test(testURL)
		: asString(thisURL) === asString(testURL);
	}

	toJSON() {
		return Object(this);
	}
}

exports.Endpoints = Endpoints;
exports.Endpoint = Endpoint;
