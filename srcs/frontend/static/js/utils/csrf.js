// CSRF token management utility
export class CSRFManager {
	constructor() {
		this.initializeCsrfToken();
		this.token = window.csrfToken;
		this.tokenRefreshInterval = 1000 * 60 * 15;
		this.setupTokenRefresh();
	}

	// Get current CSRF token
	getToken() {
		return this.token;
	}

	// Setup periodic token refresh
	setupTokenRefresh() {
		setInterval(() => this.refreshToken(), this.tokenRefreshInterval);
	}

	// Refresh CSRF token
	async refreshToken() {
		try {
			const response = await fetch('/api/csrf', {
				credentials: 'same-origin',
			});

			if (response.ok) {
				const data = await response.json();
				this.token = data.csrf_token;
				window.csrfToken = this.token;
			}
		} catch (error) {
			console.error('Failed to refresh CSRF token:', error);
		}
	}

	async initializeCsrfToken() {
		try {
			const response = await fetch('/api/csrf', {
				credentials: 'same-origin'
			});
			const data = await response.json();
			// global variable to use the CSRF token in the RegisterPage.js
			this.token = data.csrf_token;
			window.csrfToken = this.token;
		} catch (error) {
			console.error('Failed to initialize CSRF token:', error);
		}
	}
}
