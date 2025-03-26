export class LogoutPage {
	constructor() {
		this.container = document.getElementById('dynamicPage');
	}

	async handle() {
		try {
			let response;

			response = await fetch('/api/logout', {
				method: 'POST',
				credentials: 'same-origin',
				headers: {
					'X-CSRFToken': window.csrfToken,
					'Content-Type': 'application/json'
				}
			});

			if (!response.ok) {
				if (response.status == 403) {
					window.router.refreshToken();
				}
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			// window.router.updateAuthState();
			// window.router.onlineSocket.close();
			window.history.pushState({}, '', '/');
			window.dispatchEvent(new PopStateEvent('popstate'));

		} catch (error) {
			console.error('Logout failed:', error);
		}
	}
	clean() {
		return ;
	}
}
