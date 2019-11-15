const { assign, create, has, is, isNullish, isObject, asNumber, asString } = require('./util');

class Endpoints extends Array {
	add(opts) {
		const endpoint = opts instanceof Endpoint ? opts : new Endpoint(opts);

		this.push(endpoint);

		return endpoint;
	}

	clone(endpoint) {
		return this.add(endpoint.clone());
	}

	findByRequest(request) {
		return this.find(endpoint => endpoint.matchesRequest(request)) || null;
	}

	someByRequest(request) {
		return this.some(endpoint => endpoint.matchesRequest(request));
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
				url: isNullish(req.url) ? null : String(req.url),
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
			is(
				asString(testReq.url),
				asString(selfReq.url)
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
				has(testReqHeaders, name) &&
				is(testReqHeaders[name], value)
			)
		);

		if (!matchesHeaders) {
			return false;
		}

		// match the endpoint request headers
		const matchesBody = (
			isNullish(testReq.body) ||
			isNullish(selfReq.body) ||
			(
				isObject(testReq.body)
					? Object.entries(Object(selfReq.body)).every(
						([ name, value ]) => (
							has(testReq.body, name) &&
							is(testReq.body[name], value)
						)
					)
				: is(testReq.body, selfReq.body)
			)
		);

		if (!matchesBody) {
			return false;
		}

		return true;
	}

	toJSON() {
		return Object(this);
	}
}

exports.Endpoints = Endpoints;
exports.Endpoint = Endpoint;
