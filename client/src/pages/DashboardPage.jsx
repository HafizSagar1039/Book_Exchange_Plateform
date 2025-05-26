import React from "react";
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Button,
  Nav,
  Tab,
  Table,
  Spinner,
  Alert,
  Modal,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import { useBooks } from "../context/BooksContext";
import { useExchange } from "../context/ExchangeContext";
import { useAuth } from "../context/AuthContext";
import config from "../config";
const BOOK_IMAGES_URL = config.BOOK_IMAGES_URL;
const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState("books");
  const [selectedBook, setSelectedBook] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showChangeStatusModal, setShowChangeStatusModal] = useState(false);
  const [exchangeToRespond, setExchangeToRespond] = useState(null);
  const [showRespondModal, setShowRespondModal] = useState(false);

  const navigate = useNavigate();

  const {
    myBooks,
    getMyBooks,
    deleteBook,
    updateBookStatus,
    loading: booksLoading,
  } = useBooks();
  const {
    exchanges,
    getExchanges,
    respondToExchange,
    loading: exchangesLoading,
  } = useExchange();
  const { currentUser } = useAuth();

  // Load user's books and exchanges on mount
  useEffect(() => {
    getMyBooks();
    getExchanges();
  }, [getMyBooks, getExchanges]);

  // Handle delete book
  const handleDeleteBook = async () => {
    if (!selectedBook) return;

    try {
      await deleteBook(selectedBook.BookID);

      await getMyBooks();
      setShowDeleteModal(false);
      setSelectedBook(null);
    } catch (error) {
      console.error("Error deleting book:", error);
    }
  };

  // Handle status change
  const handleStatusChange = async () => {
    if (!selectedBook) return;

    try {
      await updateBookStatus(selectedBook.BookID, selectedBook.book_condition);
      await getMyBooks();

      setShowChangeStatusModal(false);
      setSelectedBook(null);
    } catch (error) {
      console.error("Error updating book status:", error);
    }
  };

  // Handle exchange response
  const handleExchangeResponse = async (status) => {
    if (!exchangeToRespond) return;

    try {
      await respondToExchange(exchangeToRespond.id, status);
      await getExchanges(); // Refresh exchanges
      setShowRespondModal(false);
      setExchangeToRespond(null);
    } catch (error) {
      console.error("Error responding to exchange:", error);
    }
  };

  // Filter exchanges by role and status
  const pendingRequests = exchanges.filter(
    (exchange) =>
      exchange.OwnerID === currentUser?.id &&
      exchange.ExchangeStatus === "Pending"
  );

  const sentRequests = exchanges.filter(
    (exchange) => exchange.SeekerID === currentUser?.id
  );

  const approvedExchanges = exchanges.filter(
    (exchange) => exchange.ExchangeStatus === "Approved"
  );

  // Loading state
  if (booksLoading && myBooks.length === 0) {
    return (
      <Container className="my-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading dashboard data...</p>
      </Container>
    );
  }

  return (
    <Container className="my-4">
      <Row className="mb-4">
        <Col>
          <h1 className="mb-4">My Dashboard</h1>

          {/* Stats Cards */}
          <div className="dashboard-stats mb-4">
            <Row>
              <Col md={3} sm={6} className="mb-3 mb-md-0">
                <Card className="h-100 border-0 dashboard-card">
                  <Card.Body>
                    <h2 className="text-primary">{myBooks.length}</h2>
                    <p className="text-muted mb-0">My Books</p>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={3} sm={6} className="mb-3 mb-md-0">
                <Card className="h-100 border-0 dashboard-card">
                  <Card.Body>
                    <h2 className="text-warning">{pendingRequests.length}</h2>
                    <p className="text-muted mb-0">Pending Requests</p>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={3} sm={6} className="mb-3 mb-md-0">
                <Card className="h-100 border-0 dashboard-card">
                  <Card.Body>
                    <h2 className="text-info">{sentRequests.length}</h2>
                    <p className="text-muted mb-0">Sent Requests</p>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={3} sm={6}>
                <Card className="h-100 border-0 dashboard-card">
                  <Card.Body>
                    <h2 className="text-success">{approvedExchanges.length}</h2>
                    <p className="text-muted mb-0">Completed Exchanges</p>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </div>

          {/* Tab Navigation */}
          <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
            <Nav variant="tabs" className="mb-4">
              <Nav.Item>
                <Nav.Link eventKey="books">
                  <i className="fas fa-book me-2"></i> My Books
                </Nav.Link>
              </Nav.Item>

              <Nav.Item>
                <Nav.Link eventKey="requests">
                  <i className="fas fa-exchange-alt me-2"></i> Exchange Requests
                  {pendingRequests.length > 0 && (
                    <Badge bg="danger" className="ms-2">
                      {pendingRequests.length}
                    </Badge>
                  )}
                </Nav.Link>
              </Nav.Item>

              <Nav.Item>
                <Nav.Link eventKey="sentRequests">
                  <i className="fas fa-paper-plane me-2"></i> Sent Requests
                </Nav.Link>
              </Nav.Item>
            </Nav>

            <Tab.Content>
              {/* My Books Tab */}
              <Tab.Pane eventKey="books">
                <div className="d-flex justify-content-between mb-3">
                  <h3>My Books</h3>
                  <Button
                    variant="primary"
                    onClick={() => navigate("/add-book")}
                  >
                    <i className="fas fa-plus me-2"></i> Add New Book
                  </Button>
                </div>

                {myBooks.length === 0 ? (
                  <Alert variant="info">
                    <i className="fas fa-info-circle me-2"></i> You haven't
                    added any books yet.
                  </Alert>
                ) : (
                  <Row xs={1} md={2} lg={3} className="g-4">
                    {myBooks.map((book, ind) => (
                      <Col key={book.id || ind}>
                        <Card className="h-100 shadow-sm">
                          <div
                            className={`book-status ${
                              book.book_condition === "Available"
                                ? "status-available"
                                : "status-unavailable"
                            }`}
                          >
                            {book.book_condition === "Available"
                              ? "Available"
                              : "Reserved"}
                          </div>

                          <div style={{ height: "150px", overflow: "hidden" }}>
                            <Card.Img
                              variant="top"
                              src={`${config.BOOK_IMAGES_URL}${book.BookImage}`}
                              alt={book.Title}
                              style={{
                                objectFit: "cover",
                                height: "100%",
                                width: "100%",
                              }}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "";
                              }}
                            />
                          </div>
                          <Card.Body className="d-flex flex-row justify-content-center align-items-center">
                            <OverlayTrigger
                              placement="top"
                              overlay={
                                <Tooltip id={`tooltip-view-${book.BookID}`}>
                                  View Book
                                </Tooltip>
                              }
                            >
                              <Button
                                variant="outline-primary"
                                size="sm"
                                className="me-2"
                                onClick={() =>
                                  navigate(`/books/${book.BookID}`)
                                }
                              >
                                <i className="fas fa-eye"></i>
                              </Button>
                            </OverlayTrigger>

                            <OverlayTrigger
                              placement="top"
                              overlay={
                                <Tooltip id={`tooltip-edit-${book.id}`}>
                                  Edit Book
                                </Tooltip>
                              }
                            >
                              <Button
                                variant="outline-secondary"
                                size="sm"
                                className="me-2"
                                onClick={() =>
                                  navigate(`/edit-book/${book.BookID}`)
                                }
                              >
                                <i className="fas fa-edit"></i>
                              </Button>
                            </OverlayTrigger>

                            <OverlayTrigger
                              placement="top"
                              overlay={
                                <Tooltip id={`tooltip-status-${book.id}`}>
                                  {book.book_condition === "Reserved"
                                    ? "Mark as Available"
                                    : "Mark as Reserved"}
                                </Tooltip>
                              }
                            >
                              <Button
                                variant={
                                  book.book_condition === "Reserved"
                                    ? "outline-warning"
                                    : "outline-success"
                                }
                                size="sm"
                                className="me-2"
                                onClick={() => {
                                  setSelectedBook(book);
                                  setShowChangeStatusModal(true);
                                }}
                              >
                                <i
                                  className={`fas ${
                                    book.book_condition === "Reserved"
                                      ? "fa-times-circle"
                                      : "fa-check-circle"
                                  }`}
                                ></i>
                              </Button>
                            </OverlayTrigger>

                            <OverlayTrigger
                              placement="top"
                              overlay={
                                <Tooltip id={`tooltip-delete-${book.id}`}>
                                  Delete Book
                                </Tooltip>
                              }
                            >
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => {
                                  setSelectedBook(book);
                                  setShowDeleteModal(true);
                                }}
                              >
                                <i className="fas fa-trash"></i>
                              </Button>
                            </OverlayTrigger>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                )}
              </Tab.Pane>

              {/* Exchange Requests Tab */}
              <Tab.Pane eventKey="requests">
                <h3>Pending Exchange Requests</h3>

                {exchangesLoading ? (
                  <div className="text-center my-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-2">Loading exchange requests...</p>
                  </div>
                ) : pendingRequests.length === 0 ? (
                  <Alert variant="info">
                    <i className="fas fa-info-circle me-2"></i> You don't have
                    any pending exchange requests.
                  </Alert>
                ) : (
                  <Table responsive hover className="mt-3">
                    <thead>
                      <tr>
                        <th>Book</th>
                        <th>Requester</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingRequests.map((exchange) => (
                        <tr key={exchange.id}>
                          <td>
                            <div className="d-flex align-items-center">
                              <img
                                src={`${BOOK_IMAGES_URL}${exchange.BookImage}`}
                                alt={exchange.Title}
                                style={{
                                  width: "50px",
                                  height: "50px",
                                  objectFit: "cover",
                                }}
                                className="me-2 rounded"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = "";
                                }}
                              />
                              <div>
                                <div className="fw-bold">{exchange.Title}</div>
                                <small className="text-muted">
                                  {exchange.Author}
                                </small>
                              </div>
                            </div>
                          </td>
                          <td>{exchange.requester_name}</td>
                          <td>
                            {new Date(exchange.created_at).toLocaleDateString()}
                          </td>
                          <td>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="me-2"
                              onClick={() => {
                                setExchangeToRespond(exchange);
                                setShowRespondModal(true);
                              }}
                            >
                              <i className="fas fa-reply me-1"></i> Respond
                            </Button>

                            <Button
                              variant="outline-info"
                              size="sm"
                              as={Link}
                              to={`/messages/${exchange.id}`}
                            >
                              <i className="fas fa-comment me-1"></i> Message
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}

                <h3 className="mt-5">All Exchange Requests</h3>

                {exchangesLoading ? (
                  <div className="text-center my-5">
                    <Spinner animation="border" variant="primary" />
                  </div>
                ) : exchanges.filter((e) => e.OwnerID === currentUser?.id)
                    .length === 0 ? (
                  <Alert variant="info">
                    <i className="fas fa-info-circle me-2"></i> You don't have
                    any exchange requests.
                  </Alert>
                ) : (
                  <Table responsive hover className="mt-3">
                    <thead>
                      <tr>
                        <th>Book</th>
                        <th>Requester</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {exchanges
                        .filter((e) => e.OwnerID === currentUser?.id)
                        .map((exchange) => (
                          <tr key={exchange.id}>
                            <td>
                              <div className="d-flex align-items-center">
                                <img
                                  src={`${BOOK_IMAGES_URL}${exchange.BookImage}`}
                                  alt={exchange.Title}
                                  style={{
                                    width: "50px",
                                    height: "50px",
                                    objectFit: "cover",
                                  }}
                                  className="me-2 rounded"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "";
                                  }}
                                />
                                <div>
                                  <div className="fw-bold">
                                    {exchange.Title}
                                  </div>
                                  <small className="text-muted">
                                    {exchange.Author}
                                  </small>
                                </div>
                              </div>
                            </td>
                            <td>{exchange.requester_name}</td>
                            <td>
                              <Badge
                                bg={
                                  exchange.ExchangeStatus === "Approved"
                                    ? "success"
                                    : exchange.ExchangeStatus === "Rejected"
                                    ? "danger"
                                    : "warning"
                                }
                              >
                                {exchange.ExchangeStatus.charAt(
                                  0
                                ).toUpperCase() +
                                  exchange.ExchangeStatus.slice(1)}
                              </Badge>
                            </td>
                            <td>
                              {new Date(
                                exchange.created_at
                              ).toLocaleDateString()}
                            </td>
                            <td>
                              {exchange.ExchangeStatus === "Approved" && (
                                <Button
                                  variant="outline-info"
                                  size="sm"
                                  as={Link}
                                  to={`/messages/${exchange.id}`}
                                >
                                  <i className="fas fa-comment me-1"></i>{" "}
                                  Message
                                </Button>
                              )}

                              {exchange.ExchangeStatus === "Pending" && (
                                <>
                                  <Button
                                    variant="outline-primary"
                                    size="sm"
                                    className="me-2"
                                    onClick={() => {
                                      setExchangeToRespond(exchange);
                                      setShowRespondModal(true);
                                    }}
                                  >
                                    <i className="fas fa-reply me-1"></i>{" "}
                                    Respond
                                  </Button>

                                  <Button
                                    variant="outline-info"
                                    size="sm"
                                    as={Link}
                                    to={`/messages/${exchange.id}`}
                                  >
                                    <i className="fas fa-comment me-1"></i>{" "}
                                    Message
                                  </Button>
                                </>
                              )}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </Table>
                )}
              </Tab.Pane>

              {/* Sent Requests Tab */}
              <Tab.Pane eventKey="sentRequests">
                <h3>My Sent Requests</h3>

                {exchangesLoading ? (
                  <div className="text-center my-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-2">Loading sent requests...</p>
                  </div>
                ) : sentRequests.length === 0 ? (
                  <Alert variant="info">
                    <i className="fas fa-info-circle me-2"></i> You haven't sent
                    any exchange requests yet.
                  </Alert>
                ) : (
                  <Table responsive hover className="mt-3">
                    <thead>
                      <tr>
                        <th>Book Requested</th> {/* Changed from "Book" */}
                        <th>Owner</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sentRequests.map((exchange) => (
                        <tr key={exchange.id}>
                          <td>
                            <div className="d-flex align-items-center">
                              <img
                                src={`${BOOK_IMAGES_URL}${exchange.BookImage}`}
                                alt={exchange.Title}
                                style={{
                                  width: "50px",
                                  height: "50px",
                                  objectFit: "cover",
                                }}
                                className="me-2 rounded"
                              />
                              <div>
                                <div className="fw-bold">{exchange.Title}</div>
                                <small className="text-muted">
                                  {exchange.Author}
                                </small>
                              </div>
                            </div>
                          </td>
                          <td>{exchange.owner_name}</td>{" "}
                          {/* Owner of the requested book */}
                          <td>
                            <Badge
                              bg={
                                exchange.ExchangeStatus === "Approved"
                                  ? "success"
                                  : exchange.ExchangeStatus === "Rejected"
                                  ? "danger"
                                  : "warning"
                              }
                            >
                              {exchange.ExchangeStatus}
                            </Badge>
                          </td>
                          <td>
                            {new Date(exchange.created_at).toLocaleDateString()}
                          </td>
                          <td>
                            <Button
                              variant="outline-info"
                              size="sm"
                              as={Link}
                              to={`/messages/${exchange.id}`}
                            >
                              <i className="fas fa-comment me-1"></i> Message to Owner
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </Tab.Pane>
            </Tab.Content>
          </Tab.Container>
        </Col>
      </Row>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete "{selectedBook?.Title}"? This action
          cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteBook}>
            Delete Book
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Change Status Modal */}
      <Modal
        show={showChangeStatusModal}
        onHide={() => setShowChangeStatusModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Change Book Status</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to mark "{selectedBook?.Title}" as{" "}
          {selectedBook?.book_condition === "Reserved"
            ? "Available"
            : "Reserved"}
          ?
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowChangeStatusModal(false)}
          >
            Cancel
          </Button>
          <Button
            variant={
              selectedBook?.book_condition === "Reserved"
                ? "success"
                : "warning"
            }
            onClick={handleStatusChange}
          >
            Mark as{" "}
            {selectedBook?.book_condition === "Available"
              ? "Reserved"
              : "Available"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Respond to Exchange Modal */}

      <Modal show={showRespondModal} onHide={() => setShowRespondModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Respond to Exchange Request</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            <strong>{exchangeToRespond?.requester_name}</strong> wants to
            exchange your book:
          </p>

          <div className="d-flex align-items-center mb-3">
            <img
              src={`${BOOK_IMAGES_URL}${exchangeToRespond?.BookImage}`}
              alt={exchangeToRespond?.Title}
              style={{ width: "60px", height: "60px", objectFit: "cover" }}
              className="me-3 rounded"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "";
              }}
            />
            <div>
              <h5 className="mb-0">{exchangeToRespond?.Title}</h5>
              <p className="text-muted mb-0">by {exchangeToRespond?.Author}</p>
            </div>
          </div>

          <div className="mb-3">
            <h6>Message from requester:</h6>
            <p className="p-3 bg-light rounded">{exchangeToRespond?.message}</p>
          </div>

          <p>
            If you approve this request, the book will be marked as unavailable.
            You can then coordinate the exchange via messages.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowRespondModal(false)}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            className="me-2"
            onClick={() => handleExchangeResponse("Rejected")}
          >
            Decline
          </Button>
          <Button
            variant="success"
            onClick={() => handleExchangeResponse("Approved")}
          >
            Approve
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default DashboardPage;
