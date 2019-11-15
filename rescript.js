const {
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

/* rescript methods
/* ========================================================================== */

const rescript = {
	/**
	* returns an apimd-enabled devFunction function
	* @arg {{ before: Function }} devConfig - devConfig object
	*/
	devServer: function newDevServer(devConfig) {
		// devConfig, ensured as an object
		devConfig = Object(devConfig);

		/** @type {Object} middleware options */
		const opts = create(defaultOpts, getPackageOpts());

		/** @type {Object} apimd middleware */
		const middleware = createMiddleware(opts);

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
	},
};

module.exports = rescript;
