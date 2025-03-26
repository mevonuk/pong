import { SafeText } from '../utils/safetext.js';

export class Header {
	constructor() {
		this.container = document.getElementById('header-container');
		this.default_path = '/static/img/deer.jpg';
	}

	async render() {
		try {
			const authState = window.router.getAuthState();
			const isLoggedIn = authState.isAuthenticated;
			const username = authState.username;
			let userImage = '/static/img/deer.jpg';

			// Get user profile image if logged in
			if (isLoggedIn) {
				try {
					const response = await fetch('/api/profile/get', {
						method: 'GET',
						credentials: 'same-origin',
						headers: {
							'Accept': 'application/json',
							'Content-Type': 'application/json',
						}
					});

					if (response.ok) {
						const data = await response.json();
						if (data.status === 'success' && data.data.image_path) {
							userImage = data.data.image_path;
						}
					}
				} catch (error) {
					console.error('Failed to load user image:', error);
				}
			}

			this.container.innerHTML = `
				<nav class="navbar navbar-expand-lg navbar-light bg-body-secondary">
					<div class="container-fluid">
						<a class="navbar-brand" href="/" data-path="/">
							<img src="/static/img/logo.svg" alt="Logo" width="150" height="50">
						</a>
						<div class="d-flex align-items-center">
							<select id="languageSelector" class="form-select me-3" >
								<option value="en">English</option>
								<option value="fr">Francais</option>
								<option value="es">Spanish</option>
								<option value="ja">日本語</option>
							</select>
							${isLoggedIn ?
								`<div class="me-3">
									<span data-translate="Welcome1" style="white-space: nowrap;"></span>
									${SafeText.escape(username)}
								</div>
								<div class="dropdown">
									<div class="profile-avatar-container" style="cursor: pointer" data-bs-toggle="dropdown">
										<img src="${SafeText.escape(userImage)}" class="rounded-circle profile-avatar"
											alt="Profile" width="40" height="40"
											onerror="this.src='${this.default_path}'">
									</div>
									<ul class="dropdown-menu dropdown-menu-end">
										<li><a class="dropdown-item" href="/profile" data-path="/profile" data-translate="Mypage"></a></li>
										<li><hr class="dropdown-divider"></li>
										<li><a class="dropdown-item" href="/logout" data-path="/logout" data-translate="Logout"></a></li>
									</ul>
								</div>` :
								`<div class="dropdown">
									<img src="/static/img/anonymous.webp" class="rounded-circle"
										alt="Profile" width="40" height="40"
										style="cursor: pointer" data-bs-toggle="dropdown">
									<ul class="dropdown-menu dropdown-menu-end">
										<li><a class="dropdown-item" href="/login" data-path="/login" data-translate="Login">Login</a></li>
										<li><a class="dropdown-item" href="/register" data-path="/register" data-translate="Register">Register</a></li>
									</ul>
								</div>`
							}
						</div>
					</div>
				</nav>
			`;

			// Load saved language
			const savedLang = localStorage.getItem("selectedLang") || "en";
			document.getElementById("languageSelector").value = savedLang;
			await updateTexts(savedLang);

			// Add language change event listener
			document.getElementById("languageSelector").addEventListener("change", async (event) => {
				const selectedLang = event.target.value;
				localStorage.setItem("selectedLang", selectedLang);
				await updateTexts(selectedLang);
			});
		} catch (error) {
			console.error('Failed to render header:', error);
		}
	}

	clean() {
		return;
	}
}
