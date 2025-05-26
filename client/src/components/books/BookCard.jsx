import React from "react";
import { Link } from "react-router-dom";
import { Card, Badge } from "react-bootstrap";
import config from "../../../src/config.js";
const BookCard = ({ book }) => {
  // Set default image if book image is not available
  // const bookImage = book.BookImage || defaultBookCover;

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Card className="book-card h-100 shadow-lg p-1 border-secondary">
      {book.book_condition !== undefined && (
        <div
          className={`book-status ${
            book.book_condition === "Available"
              ? "status-available"
              : "status-unavailable"
          }`}
        >
          {book.book_condition === "Available" ? "Available" : "Reserved"}
        </div>
      )}

      <div style={{ height: "200px", overflow: "hidden" }}>
        <Card.Img
          variant="top"
          src={`${config.BOOK_IMAGES_URL}${book.BookImage}`}
          alt={book.Title}
          style={{ objectFit: "cover", height: "100%", width: "100%" }}
        />
      </div>

      <Card.Body className="d-flex flex-column">
        <Card.Title className="text-truncate">{book.Title}</Card.Title>
        <Card.Subtitle className="mb-2 text-muted">
          by {book.Author}
        </Card.Subtitle>

        <div className="mb-2">
          <Badge bg="dark" className="me-1">
            {book.Genre}
          </Badge>

          <Badge
            bg={book.book_condition === "Available" ? "success" : "danger"}
          >
            {book.book_condition}
          </Badge>
        </div>

        <Card.Text className="text-truncate">{book.description}</Card.Text>

        <div className="mt-auto">
          <small className="text-muted">
            Added on {formatDate(book.CreatedAt)}
          </small>
          <div className="d-grid gap-2 mt-2">
            <Link
              to={`/books/${book.BookID}`}
              className="btn btn-primary btn-sm"
            >
              View Details
            </Link>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default BookCard;
