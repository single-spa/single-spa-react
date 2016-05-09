let opts;

const defaultOpts = {
	// required opts
	React: null,
	ReactDOM: null,
	rootComponent: null,
	domElementGetter: null,
}

export default function singleSpaReact(userOpts) {
	if (typeof userOpts !== 'object') {
		throw new Error(`single-spa-react requires a configuration object`);
	}

	opts = {
		...defaultOpts,
		...userOpts,
	};

	if (!opts.React) {
		throw new Error(`single-spa-react must be passed opts.React`);
	}

	if (!opts.ReactDOM) {
		throw new Error(`single-spa-react must be passed opts.ReactDOM`);
	}

	if (!opts.rootComponent) {
		throw new Error(`single-spa-react must be passed opts.rootComponent`);
	}

	if (!opts.domElementGetter) {
		throw new Error(`single-spa-react must be passed opts.domElementGetter function`);
	}

	return {
		bootstrap,
		mount,
		unmount,
	};
}

function bootstrap() {
	return new Promise((resolve, reject) => {
		resolve();
	});
}

function mount() {
	return new Promise((resolve, reject) => {
		opts.ReactDOM.render(opts.React.createElement(opts.rootComponent), getRootDomEl());
		resolve();
	});
}

function unmount() {
	return new Promise((resolve, reject) => {
		opts.ReactDOM.unmountComponentAtNode(getRootDomEl());
		resolve();
	});
}

function getRootDomEl() {
	const el = opts.domElementGetter();
	if (!el) {
		throw new Error(`single-spa-react: domElementGetter function did not return a valid dom element`);
	}

	return el;
}
