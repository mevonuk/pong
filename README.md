# pong

This project is based on the Ecole 42 project ft_transcendence. Contributors are S. Ouelghabet, M. Mahfoud, Y. Kawakita, and M. Evonuk.

The goal of the project is to offer a nice user interface with real-time multiplayer capabilities allowing users to play the classic game of Pong. The backend was constructed using Django, the frontend, javascript. The game was optimized for Google Chrome, and Docker is used to run the website.

Basic functionalities are the following:

Players can participate in a live Pong game agaisnt another player directly on the website using the same keyboard.

A tournament system is available for 3 - 8 players playing locally.

A registration system is available for players to play remote games, to track their statistics on a user dashboard, and to add/delete friends. Users can securely subscribe to the site. Users can update their username and profile image. A match history is provided for registered matches (two registered players playing each other in battle mode). Users can login, logout, and delete their accounts.

An AI player is available to play against single players. The AI can only refresh its view once per second. While the AI plays strategically, it is not perfect allowing the human user to have a chance.

A multiplyer option is available for 3 players to play a version of pong in a circular arena with each player guarding one third of the arena circumferance.

Play becomes progressively more difficult with time as the ball speed increases with each successful return.

Security: Passwords are hashed, and the website is protected against SQL injections. Two-Factor AUuthentication and JWT are used as an added layer of security.

The backend is designed as microservices. Individual microservices include the different game modes (solo, multi, classic 2-player, remote 2-player, and AI), user management, online status, and match history.

Multiple language support is provided for French, English, Spanish, and Japanese. Users can easily switch between langues at any time, even during game play.
