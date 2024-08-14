document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Evita o envio do formulário

    const username = document.getElementById('username').value.trim();

    if (username) {
        // Verifica se o usuário já existe
        if (localStorage.getItem(`user_${username}`)) {
            localStorage.setItem('currentUser', username);
            window.location.href = 'index.html'; // Redireciona para a página principal
        } else {
            // Cria um novo usuário
            localStorage.setItem(`user_${username}`, JSON.stringify({ pages: {} }));
            localStorage.setItem('currentUser', username);
            window.location.href = 'index.html'; // Redireciona para a página principal
        }
    } else {
        document.getElementById('message').textContent = 'Por favor, insira um nome de usuário.';
    }
});
