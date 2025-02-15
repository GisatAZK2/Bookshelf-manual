document.addEventListener('DOMContentLoaded', function () {
    const STORAGE_KEY = 'MyBOOK';
    const RENDER_EVENT = 'render-book';
    const SAVED_EVENT = 'saved-book';

    let books = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    let editBookId = null;

    const submitForm = document.getElementById('bookForm');
    const searchForm = document.getElementById('searchBook');

    submitForm.addEventListener('submit', function (event) {
        event.preventDefault();
        if (editBookId) {
            updateBook(editBookId);
        } else {
            addBook();
        }
    });

    searchForm.addEventListener('submit', function (event) {
        event.preventDefault();
        showSearchResults();
    });

    function generateId() {
        return +new Date(); 
    }

        function generateBookObject(id, title, author, year, isComplete) {
            return { id, title, author, year: Number(year), isComplete };
        }

    function addBook() {
        const bookTitle = document.getElementById('bookFormTitle').value.trim();
        const bookAuthor = document.getElementById('bookFormAuthor').value.trim();
        const bookYear = document.getElementById('bookFormYear').value.trim();
        const isCompleted = document.getElementById('bookFormIsComplete').checked;

        if (!bookTitle || !bookAuthor || !bookYear) {
            alert('Judul, Penulis, dan Tahun harus diisi!');
            return;
        }

        const generatedID = generateId();
        const bookObject = generateBookObject(generatedID, bookTitle, bookAuthor, bookYear, isCompleted);
        books.push(bookObject);

        document.dispatchEvent(new Event(RENDER_EVENT));
        saveData();

        submitForm.reset();
    }

    function makeBook(bookObject) {
        const container = document.createElement('div');
        container.classList.add('container', 'mt-1', 'p-3', 'rounded', 'shadow');
        container.setAttribute('data-testid', 'bookItem');
        container.setAttribute('data-bookid', bookObject.id); 

        const title = document.createElement('h3');
        title.innerText = bookObject.title;
        title.setAttribute('data-testid', 'bookItemTitle');

        const author = document.createElement('p');
        author.innerText = `Penulis: ${bookObject.author}`;
        author.setAttribute('data-testid', 'bookItemAuthor');

        const year = document.createElement('p');
        year.innerText = `Tahun: ${bookObject.year}`;
        year.setAttribute('data-testid', 'bookItemYear');

        const buttonContainer = document.createElement('div');

        const completeButton = document.createElement('button');
        completeButton.classList.add('btn', bookObject.isCompleted ? 'btn-warning' : 'btn-success', 'me-2');
        completeButton.innerText = bookObject.isCompleted ? 'Belum Selesai' : 'Selesai dibaca';
        completeButton.setAttribute('data-testid', 'bookItemIsCompleteButton');
        completeButton.addEventListener('click', () => toggleCompleteStatus(bookObject.id));

        const editButton = document.createElement('button');
        editButton.classList.add('btn', 'btn-primary', 'me-2');
        editButton.innerText = 'Edit Buku';
        editButton.setAttribute('data-testid', 'bookItemEditButton');
        editButton.addEventListener('click', () => loadEditForm(bookObject));

        const deleteButton = document.createElement('button');
        deleteButton.classList.add('btn', 'btn-danger');
        deleteButton.innerText = 'Hapus Buku';
        deleteButton.setAttribute('data-testid', 'bookItemDeleteButton');
        deleteButton.addEventListener('click', () => removeBook(bookObject.id));

        buttonContainer.append(completeButton, editButton, deleteButton);
        container.append(title, author, year, buttonContainer);
        return container;
    }

    function loadEditForm(book) {
        document.getElementById('bookFormTitle').value = book.title;
        document.getElementById('bookFormAuthor').value = book.author;
        document.getElementById('bookFormYear').value = book.year;
        document.getElementById('bookFormIsComplete').checked = book.isCompleted;

        editBookId = book.id;
        document.getElementById('bookFormSubmit').innerText = 'Perbarui Buku';

        scrollToTop();
    }

    function updateBook(bookId) {
        const bookIndex = books.findIndex(book => book.id === bookId);
        if (bookIndex === -1) return;

        books[bookIndex].title = document.getElementById('bookFormTitle').value.trim();
        books[bookIndex].author = document.getElementById('bookFormAuthor').value.trim();
        books[bookIndex].year = document.getElementById('bookFormYear').value.trim();
        books[bookIndex].isComplete = document.getElementById('bookFormIsComplete').checked;

        editBookId = null;
        document.getElementById('bookFormSubmit').innerText = 'Masukkan Buku ke rak Belum selesai dibaca';

        document.dispatchEvent(new Event(RENDER_EVENT));
        saveData();
        submitForm.reset();
    }

    function removeBook(bookId) {
        const confirmation = confirm('Apakah Anda yakin ingin menghapus buku ini?');
        if (!confirmation) return;

        books = books.filter(book => book.id !== bookId);
        document.dispatchEvent(new Event(RENDER_EVENT));
        saveData();
    }

    function toggleCompleteStatus(bookId) {
        const bookIndex = books.findIndex(book => book.id === bookId);
        if (bookIndex === -1) return;

        books[bookIndex].isCompleted = !books[bookIndex].isCompleted;
        document.dispatchEvent(new Event(RENDER_EVENT));
        saveData();
    }

    function searchBook() {
        const searchTitle = document.getElementById('searchBookTitle').value.toLowerCase().trim();
        return searchTitle ? books.filter(book => book.title.toLowerCase().includes(searchTitle)) : books;
    }

    function showSearchResults() {
        const searchResults = searchBook();
        const searchResultsContainer = document.getElementById('searchResultsModalBody');
        searchResultsContainer.innerHTML = '';

        if (searchResults.length === 0) {
            searchResultsContainer.innerHTML = '<p class="text-center">Buku tidak ditemukan!</p>';
        } else {
            searchResults.forEach(book => {
                searchResultsContainer.appendChild(makeBook(book));
            });
        }

        new bootstrap.Modal(document.getElementById('searchResultsModal')).show();
    }

    function displayBooks(bookList) {
        const uncompletedBookList = document.getElementById('incompleteBookList');
        uncompletedBookList.innerHTML = '';

        const completedBookList = document.getElementById('completeBookList');
        completedBookList.innerHTML = '';

        bookList.forEach(book => {
            const bookElement = makeBook(book);
            (book.isCompleted ? completedBookList : uncompletedBookList).appendChild(bookElement);
        });
    }

    function scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function saveData() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
        document.dispatchEvent(new Event(SAVED_EVENT));
    }

    document.addEventListener(RENDER_EVENT, () => displayBooks(books));
    document.addEventListener(SAVED_EVENT, () => console.log('Data berhasil disimpan:', localStorage.getItem(STORAGE_KEY)));

    document.dispatchEvent(new Event(RENDER_EVENT));
});
