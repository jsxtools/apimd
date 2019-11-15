const {
	assign,
	create,
	getPackageOpts,
	isFunction,
} = require('./util');
const createMiddleware = require('./middleware');

/* constants
/* ========================================================================== */

const defaultOpts = {
	src: 'src/api.md',
};

/* rewired methods
/* ========================================================================== */

/**
* returns an export object assigned an apimd-enabled devServer
* @arg {Object} exports - exports object
* @arg {Object} opts - middleware options
*/
const rewired = (exports, opts) => {
	// exports, ensured as an object
	exports = Object(exports);

	// middleware options, with pre-assign options
	opts = create(defaultOpts, getPackageOpts(), opts);

	/** @type {Object} apimd middleware */
	const middleware = createMiddleware(opts);

	/** @type {Function} old devServer property */
	const oldDevServer = exports.devServer;

	// exports object assigned an apimd-enabled devServer
	return assign(exports, {
		/**
		* returns an apimd-enabled devFunction function
		* @arg {Function} oldDevFunction
		*/
		devServer: function newDevServer(oldDevFunction) {
			// return an apimd-enabled devFunction function
			return function newDevFunction(proxy, allowedHost) {
				// old devFunction function, conditionally modified by the old devServer function
				oldDevFunction = isFunction(oldDevServer) ? oldDevServer(oldDevFunction) : oldDevFunction;

				/** @type {{ before: Function }} devConfig object, modified by the old devFunction function */
				const devConfig = oldDevFunction(proxy, allowedHost);

				/** @type {Function} old devConfig before function */
				const oldDevConfigBefore = devConfig.before;

				// apimd-enabled devConfig before function
				devConfig.before = function newDevConfigBefore(app, server, compiler) {
					if (isFunction(oldDevConfigBefore)) {
						// conditionally run the old devConfigBefore function
						oldDevConfigBefore(app, server, compiler);
					}

					// use the apimd middleware
					app.use(middleware);
				};

				// return the apimd-enabled devConfig object
				return devConfig;
			};
		},
	});
};

module.exports = rewired;
