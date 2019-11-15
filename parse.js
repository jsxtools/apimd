const {
	asNumber,
	asString,
	create,
	has,
	isArray,
	isObject,
	parseAsJson,
	parseAsMarkdown,
	parseAsYaml,
} = require('./util');

/* constants
/* ========================================================================== */

const entryMatch = /^(delete|get|head|patch|post|put)\s+([^\s]+)(?:\s+\((\d{3})\))?(?:\s|$)/i;
const resHeadersMatch = /^res(?:ponse)?(?:\s+head(?:er(?:s)?)?)(?:\s+\((\d{3})\))?(?:\s|$)/i;
const resContentMatch = /^res(?:ponse)?(?:\s+(?:body|content|json))?(?:\s+\((\d{3})\))?(?:\s|$)/i;
const reqHeadersMatch = /^req(uest)?(\s+head(er(s)?)?)(\s+|$)/i;
const reqContentMatch = /^req(uest)?(\s+(content|json))?(\s+|$)/i;
const jsonMatch = /^json(\s|$)/;
const yamlMatch = /^yaml(\s|$)/;

const defaultStatusCode = 200;

const defaultApiProps = ['response', 'body'];

/* markdown-ast methods
/* ========================================================================== */

/** return whether an item is a code block */
const isCodeBlock = item => item.type === 'codeBlock';

/** return whether an item is a heading */
const isHeading = item => item.type === 'title' && item.rank;

/** return whether an item is an entry heading */
const isEntryHeading = item => isHeading(item) && entryMatch.test(getBlockText(item));

/** return the block text string from an item */
const getBlockText = item => isArray(item.block) && isObject(item.block[0]) ? asString(item.block[0].text) : '';

/* apimd methods
/* ========================================================================== */

/** return the next api field and status code from an item, otherwise null */
const getNextApiTuple = item => {
	if (!isHeading(item)) {
		return null;
	}

	const text = getBlockText(item);

	return resHeadersMatch.test(text)
		? ['response', 'headers', asNumber(text.match(reqHeadersMatch)[5]) || defaultStatusCode]
	: resContentMatch.test(text)
		? ['response', 'body', asNumber(text.match(resContentMatch)[5]) || defaultStatusCode]
	: reqHeadersMatch.test(text)
		? ['request', 'headers']
	: reqContentMatch.test(text)
		? ['request', 'body']
	: null;
};

/** return a new api entry */
const createApiEntry = (api, item) => {
	// get the http method, url, and status code from the entry heading item
	let [, method, url, status] = getBlockText(item).match(entryMatch);

	method = asString(method).toUpperCase();
	status = asNumber(status) || defaultStatusCode;

	// conditionally create a collection for the url
	if (!has(api, url)) {
		api[url] = create();
	}

	// conditionally create a collection for the url and method
	if (!has(api[url], method)) {
		api[url][method] = [];
	}

	// create a new api entry
	const apiEntry = create({
		request: create({
			headers: create(),
			body: null,
		}),
		response: create({
			status,
			headers: create({
				'Content-Type': 'application/json; charset=utf-8'
			}),
			body: null,
		}),
	});

	// push the new api entry to the collection for the url and method
	api[url][method].push(apiEntry);

	// return the new api entry
	return apiEntry;
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

/** return an api collection from markdown source */
const parse = source => {
	const ast = parseAsMarkdown(source);

	const collection = create();

	let entry, props;

	ast.forEach(item => {
		if (isEntryHeading(item)) {
			entry = createApiEntry(collection, item);
			props = defaultApiProps;
		} else if (entry) {
			// get the next api field and status code
			const nextApiTuple = getNextApiTuple(item);

			if (nextApiTuple) {
				// conditionally update the entry field to be used by code block
				props = nextApiTuple.slice(0, 2);

				if (2 in nextApiTuple) {
					// conditionally update the entry status code
					entry.response.status = nextApiTuple[2]
				}
			} else if (isCodeBlock(item)) {
				// conditionally update the entry field using the code block
				entry[props[0]][props[1]] = parseCodeBlock(item);
			}
		}
	});

	return collection;
};

module.exports = parse;
