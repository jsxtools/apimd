const { asNumber, asString, create, has, isArray, isObject, parseAsJson, parseAsMarkdown, parseAsYaml } = require('./util');
const { Endpoints } = require('./endpoint');

/* constants
/* ========================================================================== */

const endpointMatch = /^(delete|get|head|patch|post|put)\s+([^\s]+)(?:\s+(\d{3}))?(?:\s+\(\s*([^)]+?)\s*\))?(?:\s|$)/i;
const resHeadersMatch = /^(?:res(?:ponse)?|then)(?:\s+head(?:er(?:s)?)?)(?:\s+(\d{3}))?(?:\s+\(\s*([^)]+?)\s*\))?(?:\s|$)/i;
const resContentMatch = /^(?:res(?:ponse)?|then)(?:\s+(?:body|content|json))?(?:\s+(\d{3}))?(?:\s+\(\s*([^)]+?)\s*\))?(?:\s|$)/i;
const reqHeadersMatch = /^(?:req(?:uest)?|if)(?:\s+head(?:er(?:s)?)?)(?:\s+|$)/i;
const reqContentMatch = /^(?:req(?:uest)?|if)(?:\s+(?:body|content|json))?(?:\s+|$)/i;
const jsonMatch = /^json(\s|$)/;
const yamlMatch = /^yaml(\s|$)/;

const defaultStatusCode = 200;
const defaultContentType = 'application/json; charset=utf-8';

const defaultGroup = 'response';
const defaultField = 'body';

/* markdown-ast methods
/* ========================================================================== */

/** returns whether an item is a code block */
const isCodeBlock = item => item.type === 'codeBlock';

/** returns whether an item is a heading */
const isHeading = item => item.type === 'title' && item.rank;

/** returns whether an item is an endpoint heading */
const isEndpointHeading = item => isHeading(item) && endpointMatch.test(getBlockText(item));

/** returns the block text string from an item */
const getBlockText = item => isArray(item.block) && isObject(item.block[0]) ? asString(item.block[0].text) : '';

/* apimd methods
/* ========================================================================== */

/** returns the next api field and status code from an item, otherwise null */
const getFieldTuple = item => {
	if (!isHeading(item)) {
		return null;
	}

	const text = getBlockText(item);

	return resHeadersMatch.test(text)
		? ['response', 'headers'].concat(
			asNumber(text.match(resHeadersMatch)[1]) || null,
			asString(text.match(resHeadersMatch)[2]) || null
		)
	: resContentMatch.test(text)
		? ['response', 'body'].concat(
			asNumber(text.match(resContentMatch)[1]) || null,
			asString(text.match(resContentMatch)[2]) || null
		)
	: reqHeadersMatch.test(text)
		? ['request', 'headers']
	: reqContentMatch.test(text)
		? ['request', 'body']
	: null;
};

/** returns a new api endpoint */
const createEndpoint = (all, item) => {
	// get the http method, url, and status code from the heading
	let [, method, url, status, type] = getBlockText(item).match(endpointMatch);

	method = asString(method).toUpperCase();
	status = asNumber(status) || defaultStatusCode;
	type = type || defaultContentType;

	// return the newly created endpoint
	return all.add({
		request: {
			method,
			url,
			status,
			type
		},
		response: {
			status,
			'Content-Type': type
		}
	});
};

const parseCodeBlock = item => {
	try {
		// conditionally return the parsed object from the code block
		if (jsonMatch.test(item.syntax)) {
			return parseAsJson(item.code);
		} else if (yamlMatch.test(item.syntax)) {
			return parseAsYaml(item.code);
		}
	} catch (error) {
		// do nothing and continue
	}

	// otherwise, return the contents of the code block
	return asString(item.code);
};

/** returns api endpoints from markdown source */
const parse = source => {
	const ast = parseAsMarkdown(source);

	const all = new Endpoints();

	let hasWritten = create();
	let currentGroup = defaultGroup;
	let currentField = defaultField;

	let endpoint;

	ast.forEach(item => {
		if (isEndpointHeading(item)) {
			endpoint = createEndpoint(all, item);

			currentGroup = defaultGroup;
			currentField = defaultField;

			hasWritten = create();
		} else if (endpoint) {
			// get a tuple of data from a heading item
			const tuple = getFieldTuple(item);

			if (tuple) {
				currentGroup = tuple[0];
				currentField = tuple[1];

				// conditionally create a new endpoint if the group field has already been written
				if (
					has(hasWritten, currentGroup) &&
					has(hasWritten[currentGroup], currentField)
				) {
					endpoint = all.clone(endpoint);

					hasWritten = create();
				}

				hasWritten[currentGroup] = create();
				hasWritten[currentGroup][currentField] = null;

				if (tuple[2]) {
					// conditionally update the endpoint status code
					endpoint.response.status = tuple[2];
				}

				if (tuple[3]) {
					// conditionally update the endpoint content type
					endpoint.response.headers['Content-Type'] = tuple[3];
				}
			} else if (isCodeBlock(item)) {
				// conditionally update the endpoint group field
				endpoint[currentGroup][currentField] = parseCodeBlock(item);
			}
		}
	});

	return all;
};

module.exports = parse;
