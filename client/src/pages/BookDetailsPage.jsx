import React from "react";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Container,
  Row,
  Col,
  Badge,
  Button,
  Modal,
  Form,
  Spinner,
  Alert,
  Card,
} from "react-bootstrap";
import { useForm } from "react-hook-form";
import { useBooks } from "../context/BooksContext";
import { useExchange } from "../context/ExchangeContext";
import { useAuth } from "../context/AuthContext";
import defaultBookCover from "../assets/cover.jpg";
import AddToWishlistButton from "./AddToWishlistButton";

const REVIEWS_BATCH_SIZE = 5;

const BookDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);

  // New states for reviews
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState(null);
  const [visibleReviewsCount, setVisibleReviewsCount] =
    useState(REVIEWS_BATCH_SIZE);
  const [reviewSubmitLoading, setReviewSubmitLoading] = useState(false);
  const [reviewSubmitSuccess, setReviewSubmitSuccess] = useState(false);

  const { getBookById, loading: bookLoading } = useBooks();
  const { requestExchange, loading: exchangeLoading } = useExchange();
  const { currentUser, token } = useAuth();

  // Separate form hooks for exchange request and review
  const {
    register: registerExchange,
    handleSubmit: handleSubmitExchange,
    formState: { errors: exchangeErrors },
    reset: resetExchange,
  } = useForm();

  const {
    register: registerReview,
    handleSubmit: handleSubmitReview,
    formState: { errors: reviewErrors },
    reset: resetReview,
  } = useForm();

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const bookData = await getBookById(id);
        setBook(bookData);
        console.log(bookData)
      } catch (error) {
        console.error("Error fetching book:", error);
      }
    };

    fetchBook();
  }, [id, getBookById]);

  // Fetch reviews for this book
  useEffect(() => {
    const fetchReviews = async () => {
      setReviewsLoading(true);
      setReviewsError(null);
      try {
        const response = await fetch(
          `http://localhost:5000/api/books/review/${id}`
        );
        if (!response.ok) throw new Error("Failed to fetch reviews");
        const data = await response.json();
        setReviews(data);
      } catch (error) {
        setReviewsError(error.message);
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchReviews();
  }, [id]);

  const handleRequestBook = () => {
    if (!token) {
      navigate("/login", { state: { from: `/books/${id}` } });
      return;
    }

    setShowModal(true);
    resetExchange();
  };

  const onSubmitExchange = async (data) => {
    try {
      await requestExchange(book.BookID, data.message);
      setRequestSuccess(true);
      setTimeout(() => {
        setShowModal(false);
        setRequestSuccess(false);
      }, 2000);
    } catch (error) {
      console.error("Error requesting exchange:", error);
    }
  };

  const onSubmitReview = async (data) => {
    if (!token) {
      navigate("/login", { state: { from: `/books/${id}` } });
      return;
    }
    setReviewSubmitLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/books/review",
        {
          BookID: id,
          Rating: parseInt(data.rating),
          ReviewText: data.reviewText,
          ReviewerID: currentUser.id,
          ReviewerName: `${currentUser.first_name} ${currentUser.last_name}`,
          ReviewDate: new Date().toISOString(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const newReview = {
        ReviewID: response.data.id || Date.now(),
        ReviewerName: `${currentUser.first_name} ${currentUser.last_name}`,
        ReviewDate: new Date().toISOString(),
        Rating: parseInt(data.rating),
        ReviewText: data.reviewText,
        reviewer_name: `${currentUser.first_name} ${currentUser.last_name}`,
      };

      setReviews([newReview, ...reviews]);
      resetReview();
      setReviewSubmitSuccess(true);
      setTimeout(() => setReviewSubmitSuccess(false), 3000);
    } catch (error) {
      alert(
        error.response?.data?.message ||
          error.message ||
          "Failed to submit review"
      );
    } finally {
      setReviewSubmitLoading(false);
    }
  };

  const loadMoreReviews = () => {
    setVisibleReviewsCount((prev) => prev + REVIEWS_BATCH_SIZE);
  };

  if (bookLoading || !book) {
    return (
      <Container className="my-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading book details...</p>
      </Container>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const isOwnBook = currentUser?.id === book.OwnerID;

  return (
    <Container className="my-4 fade-in">
      <div className="book-details-container">
        <Row>
          <Col md={4} className="mb-4 mb-md-0">
            <div className="book-image-container">
              <img
                src={`http://localhost:5000/uploads/book_covers/${book.BookImage}`}
                alt={book.title}
                className="img-fluid rounded"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = defaultBookCover;
                }}
              />
            </div>
          </Col>

          <Col md={8}>
            <h1 className="mb-2">{book.Title}</h1>
            <h5 className="text-muted mb-3">by {book.Author}</h5>

            <div className="mb-3">
              <Badge bg="secondary" className="me-2">
                {book.Genre}
              </Badge>

              {book.book_condition === "Available" ? (
                <Badge bg="success" className="ms-2">
                  Available
                </Badge>
              ) : (
                <Badge bg="danger" className="ms-2">
                  Reserved
                </Badge>
              )}
            </div>

            <hr />

            <div className="mb-4">
              <h5>Description</h5>
              <p>{book.description}</p>
            </div>

            <div className="mb-4">
              <h5>Owner Information</h5>
              <p>
                <i className="fas fa-user me-2"></i> {book.owner_name} {book.last_name} <br />
              </p>
                <p>
                <i className="fas fa-envelope me-2"></i> {book.owner_email}<br />
              </p>
            </div>

            <div className="mb-4">
              <h5>Additional Details</h5>
              <p>
                <strong>Added on:</strong> {formatDate(book.CreatedAt)}
              </p>
            </div>
            
            <div className="mb-4">
              <AddToWishlistButton
                book={{
                  id: book.BookID,
                  title: book.Title,
                  author: book.Author,
                  genre: book.Genre,
                }}
              />
            </div>
            
            {book.book_condition === "Available" && !isOwnBook ? (
              <div className="d-flex justify-content-between">
                <Button
                  variant={
                    book.book_condition === "Reserved" ? "danger" : "primary"
                  }
                  size="lg"
                  className="mt-3"
                  onClick={handleRequestBook}
                  disabled={book.book_condition === "Reserved"}
                >
                  <i className="fas fa-exchange-alt me-2"></i>
                  {book.book_condition === "Reserved"
                    ? "This book is reserved"
                    : "Request Exchange"}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="mt-3"
                  onClick={() => navigate(-1)}
                >
                  <i className="fa-solid fa-backward me-2"></i>Back
                </Button>
              </div>
            ) : isOwnBook ? (
              <>
                <Alert variant="info">
                  <i className="fas fa-info-circle me-2"></i> This is your book.
                </Alert>
                <Button
                  variant="secondary"
                  size="sm"
                  className="mt-3"
                  onClick={() => navigate(-1)}
                >
                  <i className="fa-solid fa-backward me-2"></i>Back
                </Button>
              </>
            ) : (
              <Alert variant="warning">
                <i className="fas fa-exclamation-triangle me-2"></i> This book
                is currently unavailable for exchange.
              </Alert>
            )}
          </Col>
        </Row>
      </div>

      {/* Reviews Section */}
      <div className="mt-5">
        <h3 className="fw-bold border-bottom pb-2 mb-4 text-primary">
          📢 Reviews
        </h3>

        {reviewsLoading && (
          <div className="text-center my-3">
            <Spinner animation="border" variant="primary" />
          </div>
        )}

        {reviewsError && (
          <Alert variant="danger" className="my-3">
            {reviewsError}
          </Alert>
        )}

        {reviews.length === 0 && !reviewsLoading && (
          <p className="text-muted fst-italic text-center bg-light p-3 rounded-3 border">
            <strong> No reviews yet. Be the first to review this book! </strong>
          </p>
        )}

        {reviews.slice(0, visibleReviewsCount).map((review) => (
          <Card
            key={review.ReviewID}
            className="mb-4 p-3 border-0 shadow-sm rounded-4"
          >
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div className="d-flex align-items-center gap-2">
                  <i className="fas fa-user-circle fa-lg text-primary"></i>
                  <h6 className="mb-0 fw-semibold text-dark">
                    {review.reviewer_name || "Anonymous"}
                  </h6>
                </div>
                <small className="text-muted">
                  {formatDate(review.ReviewDate)}
                </small>
              </div>

              <div className="mb-2">
                {[...Array(5)].map((_, i) => (
                  <i
                    key={i}
                    className={`fa-star me-1 ${
                      i < review.Rating ? "fas text-warning" : "far text-muted"
                    }`}
                  ></i>
                ))}
              </div>

              <Card.Text className="text-secondary fst-italic">
                "{review.ReviewText}"
              </Card.Text>
            </Card.Body>
          </Card>
        ))}

        {visibleReviewsCount < reviews.length && (
          <div className="d-grid mb-4">
            <Button variant="outline-primary" onClick={loadMoreReviews}>
              Load More Reviews
            </Button>
          </div>
        )}

        {token ? (
          <div className="mt-5">
            <h5 className="fw-bold text-success mb-3 border-start border-4 border-success ps-3">
              ✍️ Write a Review
            </h5>

            {reviewSubmitSuccess && (
              <Alert variant="success">Review submitted successfully!</Alert>
            )}

            <Form
              onSubmit={handleSubmitReview(onSubmitReview)}
              className="p-3 border rounded-4 shadow-sm bg-light"
            >
              <Form.Group controlId="rating" className="mb-3">
                <Form.Label className="fw-semibold">⭐ Rating</Form.Label>
                <Form.Select
                  {...registerReview("rating", { required: "Rating is required" })}
                  aria-label="Rating"
                  className="rounded-3"
                >
                  <option value="">Select rating</option>
                  {[5, 4, 3, 2, 1].map((r) => (
                    <option key={r} value={r}>
                      {r} Star{r > 1 ? "s" : ""}
                    </option>
                  ))}
                </Form.Select>
                {reviewErrors.rating && (
                  <small className="text-danger">{reviewErrors.rating.message}</small>
                )}
              </Form.Group>

              <Form.Group controlId="reviewText" className="mb-3">
                <Form.Label className="fw-semibold">📝 Your Review</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  {...registerReview("reviewText", {
                    required: "Review text is required",
                    minLength: {
                      value: 10,
                      message: "Review should be at least 10 characters",
                    },
                  })}
                  className="rounded-3"
                  placeholder="Write your honest thoughts..."
                />
                {reviewErrors.reviewText && (
                  <small className="text-danger">
                    {reviewErrors.reviewText.message}
                  </small>
                )}
              </Form.Group>

              <Button
                type="submit"
                variant="success"
                disabled={reviewSubmitLoading}
                className="w-100 fw-semibold rounded-3"
              >
                {reviewSubmitLoading ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                    Submitting...
                  </>
                ) : (
                  "✅ Submit Review"
                )}
              </Button>
            </Form>
          </div>
        ) : (
          <Alert variant="info" className="mt-4 text-center">
            <a href="/login" className="text-decoration-none fw-semibold">
              Log in
            </a>{" "}
            to write a review.
          </Alert>
        )}
      </div>

      {/* Modal for exchange request */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Request Book Exchange</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {requestSuccess ? (
            <Alert variant="success">
              <i className="fas fa-check-circle me-2"></i> Exchange request sent
              successfully!
            </Alert>
          ) : (
            <Form onSubmit={handleSubmitExchange(onSubmitExchange)}>
              <Form.Group className="mb-3">
                <Form.Label>Book Title</Form.Label>
                <Form.Control
                  type="text"
                  value={book.Title}
                  readOnly
                  disabled
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Message to Owner</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  placeholder="Introduce yourself and explain why you'd like to exchange this book..."
                  {...registerExchange("message", {
                    required: "Please include a message to the owner",
                  })}
                  isInvalid={!!exchangeErrors.message}
                />
                {exchangeErrors.message && (
                  <Form.Control.Feedback type="invalid">
                    {exchangeErrors.message.message}
                  </Form.Control.Feedback>
                )}
              </Form.Group>

              <div className="text-end">
                <Button
                  variant="secondary"
                  className="me-2"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  disabled={exchangeLoading}
                >
                  {exchangeLoading ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        className="me-2"
                      />
                      Sending...
                    </>
                  ) : (
                    "Send Request"
                  )}
                </Button>
              </div>
            </Form>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default BookDetailsPage;