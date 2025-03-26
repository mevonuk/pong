export class RegisterPage {
	async handle() {

		const content = `
<section class="gradient-custom">
	<div class="container py-5 h-100">
		<div class="row d-flex justify-content-center align-items-center h-100">
			<div class="col-12 col-md-8 col-lg-6 col-xl-5">
				<div class="card bg-dark text-white" style="border-radius: 1rem;">
					<div class="card-body p-5 text-center">
						<div class="mb-md-5 mt-md-4 pb-5">
							<h2 class="fw-bold mb-2 text-uppercase"data-translate="Register"></h2>
							<p class="text-white-50 mb-5" data-translate= "createaccount"></p>

							<div class="form-outline form-white mb-4">
								<input type="text" id="typeUsernameX" class="form-control form-control-lg" placeholder="Username" data-translate="user-placeholder" />
								<div id="usernameError" class="text-danger small mt-1" style="display: none;" ></div>
							</div>

							<div class="form-outline form-white mb-4">
								<input type="email" id="typeEmailX" class="form-control form-control-lg" placeholder="Email" data-translate="email_placeholder"/>
								<div id="emailError" class="text-danger small mt-1" style="display: none;" ></div>
							</div>

							<div class="form-outline form-white mb-4">
								<input type="password" id="typePasswordX" class="form-control form-control-lg" placeholder="Password" data-translate="pwd_placeholder"/>
								<div class="password-strength-meter mt-1">
									<div class="progress" style="height: 5px;">
										<div id="passwordStrength" class="progress-bar" role="progressbar" style="width: 0%"></div>
									</div>
									<small class="text-white-50" data-translate="pwd-rules"></small>
								</div>
								<div id="passwordError" class="text-danger small mt-1" style="display: none;" ></div>
							</div>

							<div class="form-outline form-white mb-4">
								<input type="password" id="typeConfirmPasswordX" class="form-control form-control-lg" placeholder="Confirm Password" data-translate="pwd2_placeholder"/>
								<div class="password-strength-meter mt-1">
									<div class="progress" style="height: 5px;">
										<div id="passwordConfirmStrength" class="progress-bar" role="progressbar" style="width: 0%"></div>
									</div>
									<small class="text-white-50" data-translate="pwd-rules"></small>
								</div>
								<div id="confirmPasswordError" class="text-danger small mt-1" style="display: none;" ></div>
							</div>

							<button class="btn btn-outline-light btn-lg px-5" type="submit" id="registerButton" data-translate = "Register"></button>

							<div class="d-flex justify-content-center text-center mt-4 pt-1">
								<a href="#!" class="text-white"><i class="fab fa-facebook-f fa-lg"></i></a>
								<a href="#!" class="text-white"><i class="fab fa-twitter fa-lg mx-4 px-2"></i></a>
								<a href="#!" class="text-white"><i class="fab fa-google fa-lg"></i></a>
							</div>
						</div>

						<div>
							<p class="mb-0" data-translate="already"><a href="/login" data-path="/login" class="text-white-50 fw-bold" data-translate="sign-in"></a></p>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>
		`;

		document.getElementById('dynamicPage').innerHTML = content;
		this.addEventListeners();
	}

	async sendToBackend(e) {
		if (this.validateForm(e) == false) {
			return false;
		}

		let response;

		try {
			response = await fetch('/api/register', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-CSRFToken': window.csrfToken,
				},
				credentials: 'include',
				body: JSON.stringify({
					'username': document.getElementById('typeUsernameX').value,
					'email': document.getElementById('typeEmailX').value,
					'password': document.getElementById('typePasswordX').value
				 })
			});

			if (!response.ok) {
				if (response.status == 403) {
					window.router.refreshToken();
					confirmPasswordError.textContent = translationsData["error-register1"];
					confirmPasswordError.style.display = 'block';
				} else if (response.status == 409) {
					emailError.textContent = translationsData["error-register2"];
					emailError.style.display = 'block';
				} else if (response.status == 400) {
					confirmPasswordError.textContent = translationsData["error-register3"];
					confirmPasswordError.style.display = 'block';
				}
				return false;
			}

			const data = await response.json();

			// Store email for verification page
			sessionStorage.setItem('pendingVerificationEmail', document.getElementById('typeEmailX').value);
			// Navigate to verification page
			window.router.navigateTo('/verify');
		} catch (error) {
			if (response.status == 403) {
				confirmPasswordError.textContent = translationsData["error-register3"];
				confirmPasswordError.style.display = 'block';
				window.router.refreshToken();
			}
			throw error;
		}
	}

	//parsing of the Form
	validateForm(e) {
		e.preventDefault();  // Prevent form submission by default

		const username		= document.getElementById('typeUsernameX');
		const email		= document.getElementById('typeEmailX');
		const password		= document.getElementById('typePasswordX');
		const confirmPassword	= document.getElementById('typeConfirmPasswordX');

		const usernameError	= document.getElementById('usernameError');
		const emailError		= document.getElementById('emailError');
		const passwordError	= document.getElementById('passwordError');
		const confirmPasswordError	= document.getElementById('confirmPasswordError');

		let isValid		= true;

		// Reset error messages
		usernameError.style.display = 'none';
		emailError.style.display = 'none';
		passwordError.style.display = 'none';
		confirmPasswordError.style.display = 'none';

		// Validate username
		if (!username.value.trim()) {
			usernameError.textContent = translationsData["usererror3"];
			usernameError.style.display = 'block';
			isValid = false;
		} else if (username.value.length > 20) {
			usernameError.textContent = translationsData["usererror1"];
			usernameError.style.display = 'block';
			username.classList.add('is-invalid');
			isValid = false;
		} else if (username.value.match(/[!@#$%^&*()_+\-=\[\]{};:"\|,.<>/?]/)) {
			usernameError.textContent = translationsData["usererror2"];
			usernameError.style.display = 'block';
			isValid = false;
		}

		// Validate email
		if (!email.value.trim()) {
			emailError.textContent = translationsData["emailerror1"];
			emailError.style.display = 'block';
			isValid = false;
		} else if (email.value.length >= 255) {
			emailError.textContent = translationsData["emailerror2"];
			emailError.style.display = 'block';
			isValid = false;
		} else if (!this.isValidEmail(email.value)) {
			emailError.textContent = translationsData["emailerror3"];
			emailError.style.display = 'block';
			isValid = false;
		}

		// Validate password
		if (!password.value.trim()) {
			passwordError.textContent = translationsData["errorpwd"];
			passwordError.style.display = 'block';
			isValid = false;
		} else if (password.value.length < 8) {
			passwordError.style.display = 'block';
			isValid = false;
		}

		// Validate confirm password
		if (!confirmPassword.value.trim()) {
			confirmPasswordError.textContent = translationsData["errorpwd"];
			confirmPasswordError.style.display = 'block';
			isValid = false;
		} else if (password.value !== confirmPassword.value) {
			confirmPasswordError.textContent = translationsData["error-pwd3"];;
			confirmPasswordError.style.display = 'block';
			isValid = false;
		}

		return isValid;
	}

	validateUsername(e) {
		const username = e.target;
		const usernameError = document.getElementById('usernameError');
		usernameError.textContent = translationsData["usererror2"];

		if (!username.value.trim()) {
			usernameError.textContent = translationsData["usererror3"];
			usernameError.style.display = 'block';
		} else if (username.value.length >= 150) {
			usernameError.textContent = translationsData["usererror1"];
			usernameError.style.display = 'block';
			username.classList.add('is-invalid');
		} else {
			usernameError.style.display = 'none';
			username.classList.remove('is-invalid');
		}
	}

	isValidEmail(email) {
		const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
		return emailRegex.test(email);
	}

	validateEmail(e) {
		const email = e.target;
		const emailError = document.getElementById('emailError');
		emailError.textContent = translationsData["emailerror4"];

		if (!this.isValidEmail(email.value)) {
			emailError.style.display = 'block';
			email.classList.add('is-invalid');
		} else if (email.value.length >= 255) {
			emailError.textContent = translationsData["emailerror2"];
			emailError.style.display = 'block';
			email.classList.add('is-invalid');
		} else {
			emailError.style.display = 'none';
			email.classList.remove('is-invalid');
		}
	}

	updatePasswordStrength(e) {
		const password = e.target.value;
		const strengthBar = document.getElementById('passwordStrength');

		// Calculate strength and update progress bar
		if (password.length >= 8) {
			strengthBar.style.width = '100%';
			strengthBar.className = 'progress-bar bg-success';
		} else {
			strengthBar.style.width = (password.length * 12.5) + '%';  // 12.5% per character
			strengthBar.className = 'progress-bar bg-danger';
		}
	}

	updatePasswordConfirmStrength(e) {
		const password = e.target.value;
		const strengthBar = document.getElementById('passwordConfirmStrength');
		const originalPassword = document.getElementById('typePasswordX').value;

		// Calculate strength and update progress bar
		if (password === originalPassword && password.length >= 8) {
			strengthBar.style.width = '100%';
			strengthBar.className = 'progress-bar bg-success';
		} else {
			strengthBar.style.width = (password.length * 12.5) + '%';  // 12.5% per character
			strengthBar.className = 'progress-bar bg-danger';
		}

		// Show/hide error message
		const confirmPasswordError = document.getElementById('confirmPasswordError');
		if (password !== originalPassword && password !== '') {
			confirmPasswordError.textContent = translationsData["error-pwd3"];
			confirmPasswordError.style.display = 'block';
		} else {
			confirmPasswordError.style.display = 'none';
		}
	}

	addEventListeners() {
		// Add event listeners with correct binding
		document.getElementById('typeUsernameX').addEventListener('input', (e) => this.validateUsername(e));
		document.getElementById('registerButton').addEventListener('click', (e) => this.sendToBackend(e));
		document.getElementById('typePasswordX').addEventListener('input', (e) => this.updatePasswordStrength(e));
		document.getElementById('typeConfirmPasswordX').addEventListener('input', (e) => this.updatePasswordConfirmStrength(e));
		document.getElementById('typeEmailX').addEventListener('input', (e) => this.validateEmail(e));
	}

	clean() {
		return ;
	}
}
