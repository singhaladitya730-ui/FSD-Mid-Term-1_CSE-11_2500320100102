const express = require("express");
const app = express();
app.use(express.json());
const PORT = 3000;
let books = [];
app.post("/api/books", (req, res) => {
    const { id, title, author, category, quantity } = req.body;
    if (
        id === undefined ||
        title === undefined ||
        author === undefined ||
        category === undefined ||
        quantity === undefined
    ) {
        return res.status(400).json({
            message: "All fields are required"
        });
    }
    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            message: "Book ID must be a positive integer"
        });
    }
    if (
        typeof title !== "string" || !title.trim() ||
        typeof author !== "string" || !author.trim() ||
        typeof category !== "string" || !category.trim()
    ) {
        return res.status(400).json({
            message: "Invalid book details"
        });
    }
    if (!Number.isInteger(quantity) || quantity < 0) {
        return res.status(400).json({
            message: "Quantity must be a non-negative integer"
        });
    }
    const existingBook = books.find(book => book.id === id);

    if (existingBook) {
        return res.status(409).json({
            message: "Book with this ID already exists"
        });
    }
    const newBook = {
        id,
        title: title.trim(),
        author: author.trim(),
        category: category.trim(),
        quantity,
        availability: quantity
    };
    books.push(newBook);
    res.status(201).json({
        message: "Book added successfully",
        book: newBook
    });
});
app.put("/api/books/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const book = books.find(book => book.id === id);

    if (!book) {
        return res.status(404).json({
            message: "Book not found"
        });
    }

    const { title, author, category, quantity } = req.body;

    if (quantity !== undefined) {
        const issued = book.quantity - book.availability;

        if (!Number.isInteger(quantity) || quantity < issued) {
            return res.status(400).json({
                message: "Invalid quantity"
            });
        }

        book.availability = quantity - issued;
        book.quantity = quantity;
    }

    if (title !== undefined) book.title = title;
    if (author !== undefined) book.author = author;
    if (category !== undefined) book.category = category;

    res.status(200).json({
        message: "Book updated successfully",
        book: book
    });
});
app.delete("/api/books/:id", (req, res) => {    
    const id = parseInt(req.params.id);
    const index = books.findIndex(book => book.id === id);

    if (index === -1) {
        return res.status(404).json({
            message: "Book not found"
        });
    }

    if (books[index].availability < books[index].quantity) {
        return res.status(400).json({
            message: "Cannot delete book. Copies are issued"
        });
    }

    books.splice(index, 1);

    res.status(200).json({
        message: "Book deleted successfully"
    });
});
app.get("/api/books/search", (req, res) => {
    const title = req.query.title;

    if (!title) {
        return res.status(400).json({
            message: "Please enter book title"
        });
    }

    const result = books.filter(book =>
        book.title.toLowerCase().includes(title.toLowerCase())
    );

    if (result.length === 0) {
        return res.status(404).json({
            message: "No matching books found"
        });
    }

    res.status(200).json({
        message: "Books found",
        books: result
    });
});
app.post("/api/books/:id/issue", (req, res) => {
    const id = parseInt(req.params.id);
    const book = books.find(book => book.id === id);

    if (!book) {
        return res.status(404).json({
            message: "Book not found"
        });
    }

    if (book.availability <= 0) {
        return res.status(400).json({
            message: "No copies available"
        });
    }

    book.availability--;

    res.status(200).json({
        message: "Book issued successfully",
        book: book
    });
});
app.post("/api/books/:id/return", (req, res) => {
    const id = parseInt(req.params.id);
    const book = books.find(book => book.id === id);

    if (!book) {
        return res.status(404).json({
            message: "Book not found"
        });
    }

    if (book.availability >= book.quantity) {
        return res.status(400).json({
            message: "No issued copies to return"
        });
    }

    book.availability++;

    res.status(200).json({
        message: "Book returned successfully",
        book: book
    });
});

app.get("/api/books", (req, res) => {
    if (books.length === 0) {
        return res.status(404).json({
            message: "No books available"
        });
    }
    res.status(200).json({
        message: "Books retrieved successfully",
        books: books
    });
});

app.get("/api/books/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const book = books.find(book => book.id === id);

    if (!book) {
        return res.status(404).json({
            message: "Book not found"
        });
    }
    res.status(200).json({
        message: "Book retrieved successfully",
        book: book
    });
});
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});