document.addEventListener('DOMContentLoaded', () => {
    let currentPageNumber = null;
    const pageNameInput = document.getElementById('pageNameInput');
    const savePageButton = document.getElementById('savePage');
    const titleInput = document.getElementById('titleInput');
    const thumbnailsList = document.getElementById('thumbnails-list');
    const quill = new Quill('#editor', {
        theme: 'snow',
        modules: {
            toolbar: [
                [{ 'font': [] }],
                [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                ['bold', 'italic', 'underline'],
                [{ 'color': [] }, { 'background': [] }],
                [{ 'align': [] }],
                ['link'],
                ['clean']
            ]
        }
    });

    const username = localStorage.getItem('currentUser');
    if (!username) {
        window.location.href = 'login.html';
        return;
    }

    let userData = JSON.parse(localStorage.getItem(`user_${username}`)) || { pages: {} };

    function getNextPageNumber() {
        const pageNumbers = Object.keys(userData.pages).map(num => parseInt(num));
        let nextNumber = 1;
        while (pageNumbers.includes(nextNumber)) {
            nextNumber++;
        }
        return nextNumber;
    }

    function createNewPage(name = `Página ${getNextPageNumber()}`) {
        const pageNumber = getNextPageNumber();

        userData.pages[pageNumber] = { content: JSON.stringify(quill.getContents()), name };
        localStorage.setItem(`user_${username}`, JSON.stringify(userData));

        addThumbnail(pageNumber, name);
        loadPage(pageNumber);
    }

    function addThumbnail(pageNumber, name) {
        const existingThumbnail = document.querySelector(`.thumbnail[data-page-number="${pageNumber}"]`);
        if (existingThumbnail) return; 

        const thumbnail = document.createElement('div');
        thumbnail.classList.add('thumbnail');
        thumbnail.dataset.pageNumber = pageNumber;

        thumbnail.innerHTML = `
            <span>${name}</span>
            <button class="delete-button">X</button>
        `;

        thumbnail.querySelector('.delete-button').addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm('Tem certeza de que deseja deletar esta página?')) {
                deletePage(pageNumber);
            }
        });

        thumbnail.addEventListener('click', () => {
            if (currentPageNumber !== null) {
                savePage();
            }
            loadPage(pageNumber);
            pageNameInput.value = name;
            document.querySelectorAll('.thumbnail').forEach(thumbnail => thumbnail.classList.remove('active'));
            thumbnail.classList.add('active');
        });

        thumbnailsList.appendChild(thumbnail);
    }

    function savePage() {
        if (currentPageNumber !== null) {
            const content = JSON.stringify(quill.getContents());
            const name = pageNameInput.value.trim() || `Página ${currentPageNumber}`;
            userData.pages[currentPageNumber] = { content, name };
            localStorage.setItem(`user_${username}`, JSON.stringify(userData));

            const thumbnailSpan = document.querySelector(`.thumbnail[data-page-number="${currentPageNumber}"] span`);
            if (thumbnailSpan) {
                thumbnailSpan.textContent = name;
            }
        }
    }

    function loadPage(pageNumber) {
        const pageData = userData.pages[pageNumber];
        if (pageData) {
            quill.setContents(pageData.content ? JSON.parse(pageData.content) : []);
            pageNameInput.value = pageData.name || `Página ${pageNumber}`;
            currentPageNumber = pageNumber;
            document.querySelectorAll('.thumbnail').forEach(thumbnail => thumbnail.classList.remove('active'));
            document.querySelector(`.thumbnail[data-page-number="${pageNumber}"]`).classList.add('active');
        }
    }

    function loadSavedPages() {
        thumbnailsList.innerHTML = '';

        Object.keys(userData.pages).forEach(pageNumber => {
            const { name } = userData.pages[pageNumber];
            addThumbnail(Number(pageNumber), name);
        });

        if (document.querySelector('.thumbnail')) {
            document.querySelector('.thumbnail').click();
        }
    }

    function deletePage(pageNumber) {
        delete userData.pages[pageNumber];
        localStorage.setItem(`user_${username}`, JSON.stringify(userData));

        const thumbnail = document.querySelector(`.thumbnail[data-page-number="${pageNumber}"]`);
        if (thumbnail) {
            thumbnail.remove();
        }

        const thumbnails = document.querySelectorAll('.thumbnail');
        if (thumbnails.length > 0) {
            thumbnails[0].click();
        } else {
            quill.setContents([]);
            pageNameInput.value = '';
            currentPageNumber = null;
        }
    }

    document.getElementById('newPage').addEventListener('click', () => {
        createNewPage();
    });

    savePageButton.addEventListener('click', () => {
        savePage();
    });

    pageNameInput.addEventListener('input', () => {
        if (currentPageNumber !== null) {
            savePage();
        }
    });

    titleInput.addEventListener('change', () => {
        localStorage.setItem('bookTitle', titleInput.value.trim());
    });

    const savedTitle = localStorage.getItem('bookTitle');
    if (savedTitle) {
        titleInput.value = savedTitle;
    }

    loadSavedPages();
});
