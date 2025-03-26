export class SafeText {
	constructor(text) {
		this.text = text;
	}

	render() {
		const element = document.createElement('span');
		const text = document.createTextNode(this.text);

		element.appendChild(text);
		return element;
	}

	static escape(str) {
		if (str === null || str === undefined) {
			return '';
		}
		const safeStr = String(str);
		return safeStr.replace(/[&<>"']/g, function(match) {
			const escape = {
				'&': '&amp;',
				'<': '&lt;',
				'>': '&gt;',
				'"': '&quot;',
				"'": '&#39;'
			};
			return escape[match];
		});
	}
}

