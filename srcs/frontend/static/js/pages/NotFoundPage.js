export class NotFoundPage {
	constructor() {
		this.container = document.getElementById('dynamicPage');
	}

	async handle() {
		this.render();
	}

	render() {
		const notFoundContent = document.createElement('div');
		notFoundContent.className = 'not-found-container';
		notFoundContent.innerHTML = `
			<div class="error-content text-center">
				<h1>404</h1>
				<h2 data-translate = "error404"></h2>
				<p data-translate="page-error"></p>
				<a href="/" data-path="/" class="btn btn-primary" data-translate="return-home"></a>
			</div>
		`;

		this.container.innerHTML = '';
		this.container.appendChild(notFoundContent);
	}
	
	clean() {
		return ;
	}
}

/*

	This is exactly the same thing than the HomePage

	but this time we didn't find the page we were asking for.

*/
