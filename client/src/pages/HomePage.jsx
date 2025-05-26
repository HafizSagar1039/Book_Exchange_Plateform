import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useBooks } from "../context/BooksContext";
import useDebounce from "../hooks/useDebounce";
import BookCard from "../components/books/BookCard";
import styles from "./HomePage.module.css";

const HomePage = () => {
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("");
  const [page, setPage] = useState(1);
  const [displayedBooks, setDisplayedBooks] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const debouncedSearch = useDebounce(search, 500);

  const { books, loading, getBooks } = useBooks();

  // Load books on mount and when search params change
  useEffect(() => {
    getBooks(debouncedSearch, genre);
    setPage(1);
    setHasMore(true);
  }, [debouncedSearch, genre, getBooks]);

  // Update displayed books when books or page changes
  useEffect(() => {
    if (page === 1) {
      setDisplayedBooks(books.slice(0, 9)); // First 3 rows (3 books per row)
    } else {
      setDisplayedBooks((prev) => [
        ...prev,
        ...books.slice((page - 1) * 9, page * 9),
      ]);
    }
    setHasMore(books.length > displayedBooks.length + 9);
  }, [books, page]);

  // List of genres
  const genres = [
    "Science Fiction",
    "Biography",
    "History",
    "Children",
    "Young Adult",
    "Business",
    "Cooking",
    "Art",
    "Travel",
    "Programming",
    "others",
  ];

  const loadMoreBooks = () => {
    setPage((prevPage) => prevPage + 1);
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <Container>
          <Row className="align-items-center">
            <Col lg={6} className="mb-5 mb-lg-0">
              <h1 className={styles.heroTitle}>
                Share <span className="text-primary">Books</span>, Exchange{" "}
                <span className="text-primary">Ideas</span>
              </h1>
              <p className={styles.heroSubtitle}>
                Join our community of book lovers to exchange books, discover
                new reads, and connect with fellow readers.
              </p>

              <div className={styles.heroStats}>
                <div className={styles.statItem}>
                  <span className={styles.statNumber}>5,000+</span>
                  <span className={styles.statLabel}>Books</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statNumber}>2,100+</span>
                  <span className={styles.statLabel}>Users</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statNumber}>8,500+</span>
                  <span className={styles.statLabel}>Exchanges</span>
                </div>
              </div>
            </Col>

            <Col lg={6}>
              <div className={styles.heroImageContainer}>
                <img
                  src="https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg"
                  alt="Books on a shelf"
                  className={styles.heroImage}
                />
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* How It Works Section */}
      <section className={styles.howItWorksSection}>
        <Container>
          <h2 className={styles.sectionTitle}>How It Works</h2>
          <p className={styles.sectionSubtitle}>
            Exchange books in 3 simple steps
          </p>

          <Row className="mt-5">
            <Col md={4} className="mb-4 mb-md-0">
              <div className={styles.stepCard}>
                <div className={styles.stepIcon}>
                  <i className="fas fa-book"></i>
                </div>
                <h3 className={styles.stepTitle}>List Your Books</h3>
                <p className={styles.stepDescription}>
                  Add books you're willing to exchange to your collection with
                  details and photos.
                </p>
              </div>
            </Col>

            <Col md={4} className="mb-4 mb-md-0">
              <div className={styles.stepCard}>
                <div className={styles.stepIcon}>
                  <i className="fas fa-search"></i>
                </div>
                <h3 className={styles.stepTitle}>Find Books</h3>
                <p className={styles.stepDescription}>
                  Browse through thousands of books or search for specific
                  titles you want.
                </p>
              </div>
            </Col>

            <Col md={4}>
              <div className={styles.stepCard}>
                <div className={styles.stepIcon}>
                  <i className="fas fa-exchange-alt"></i>
                </div>
                <h3 className={styles.stepTitle}>Exchange</h3>
                <p className={styles.stepDescription}>
                  Request an exchange, communicate with the owner, and arrange
                  the swap.
                </p>
              </div>
            </Col>
          </Row>

          <div className="text-center mt-5">
            <Link to="/login">
              <Button variant="primary" size="lg">
                Join Now
              </Button>
            </Link>
          </div>
        </Container>
      </section>

      {/* Main Content */}
      <Container>
        {/* Filters */}
        <div className="search-container mb-4 fade-in">
          <Row>
            <Col md={4} className="mb-3 mb-md-0">
              <Form.Group>
                <Form.Label>Genre</Form.Label>
                <Form.Select
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                >
                  <option value="">All Genres</option>
                  {genres.map((g, index) => (
                    <option key={index} value={g}>
                      {g}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={4} className="mb-3 mb-md-0">
              <Form.Group>
                <Form.Label>Search by Title or Author</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="e.g., Harry Potter or J.K. Rowling"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </Form.Group>
            </Col>

            <Col md={4} className="d-flex align-items-end">
              <Button
                variant="primary"
                className="w-100"
                onClick={() => {
                  setPage(1);
                  getBooks(search, genre);
                }}
              >
                <i className="fas fa-search me-2"></i> Search
              </Button>
            </Col>
          </Row>
        </div>

        {/* Results */}
        <h2 className="mb-4">
          Available Books{" "}
          {displayedBooks.length > 0 &&
            `(${displayedBooks.length}/${books.length})`}
        </h2>

        {loading && page === 1 ? (
          <div className="text-center my-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2">Loading books...</p>
          </div>
        ) : displayedBooks.length > 0 ? (
          <>
            <Row xs={1} md={2} lg={3} className="g-3 fade-in">
              {displayedBooks.map((book, index) => (
                <Col key={book.id || index}>
                  <BookCard book={book} />
                </Col>
              ))}
            </Row>

            {hasMore && (
              <div className="text-center mt-4">
                <Button
                  variant="outline-danger"
                  size="lg"
                  onClick={loadMoreBooks}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner
                        as="span"
                        size="sm"
                        animation="border"
                        role="status"
                      />
                      <span className="ms-2">Loading...</span>
                    </>
                  ) : (
                    <>
                      Load More
                      <i className="fas fa-arrow-down ms-2"></i>
                    </>
                  )}
                </Button>
                <p className="text-muted mt-3 small">
                  Discover more great books from our community
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center my-5 py-5 fade-in">
            <i className="fas fa-book fa-3x mb-3 text-muted"></i>
            <h3>No books found</h3>
            <p className="text-muted">
              Try adjusting your search filters or add a book to share with
              others.
            </p>
          </div>
        )}
      </Container>
    </div>
  );
};

export default HomePage;
