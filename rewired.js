const { create, getPackageOpts, isFunction } = require('./util');
const createMiddleware = require('./middleware');

/* constants
/* ========================================================================== */

const defaultOpts = {
	live: true,
	src: 'src/api.md',
};

/* rewired methods
/* ========================================================================== */

/**
* returns an apimd-enabled devServer function
* @arg {Object} opts - middleware options
* @arg {Function} devServer - devServer function to run before
*/
const rewired = (opts, devServer) => {
	// middleware options, with pre-assign options
	opts = create(defaultOpts, getPackageOpts(), opts);

	/** @type {Object} apimd middleware */
	const middleware = createMiddleware(opts);

	/**
	* returns an apimd-enabled devFunction function
	* @arg {Function} devFunction
	*/
	return function newDevServer(devFunction) {
		// return an apimd-enabled devFunction function
		return function newDevFunction(proxy, allowedHost) {
			// old devFunction function, conditionally modified by the old devServer function
			devFunction = isFunction(devServer) ? devServer(devFunction) : devFunction;

			/** @type {{ before: Function }} devConfig object, modified by the old devFunction function */
			const devConfig = devFunction(proxy, allowedHost);

			/** @type {Function} devConfig.before function to run before */
			const devConfigBefore = devConfig.before;

			// apimd-enabled devConfig before function
			devConfig.before = function newDevConfigBefore(app, server, compiler) {
				if (isFunction(devConfigBefore)) {
					// conditionally run the old devConfigBefore function
					devConfigBefore(app, server, compiler);
				}

				// use the apimd middleware
				app.use(middleware);
			};

			// return the apimd-enabled devConfig object
			return devConfig;
		};
	}
};

module.exports = rewired;
