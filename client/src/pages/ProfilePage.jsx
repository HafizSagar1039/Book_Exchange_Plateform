import React from "react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Alert,
  Spinner,
  Badge,
  ListGroup,
  Form,
  Accordion
} from "react-bootstrap";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import config from "../config";

const API_URL = config.API_URL;

const ProfilePage = () => {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [wishlist, setWishlist] = useState([]);

  const { currentUser, updateProfile } = useAuth();

  // Fetch user's wishlist
  const fetchWishlist = async () => {
    try {
      setWishlistLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_URL}/users/wishlist/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setWishlist(response.data.wishlist);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    } finally {
      setWishlistLoading(false);
    }
  };

  // Remove book from wishlist
  const removeFromWishlist = async (id) => {
    try {
      setWishlistLoading(true);
      const token = localStorage.getItem("token");
      await axios.delete(
        `${API_URL}/users/wishlist/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setWishlist(wishlist.filter((item) => item.id !== id));
      await fetchWishlist();
    } catch (error) {
      console.error("Error removing from wishlist:", error);
    } finally {
      setWishlistLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  if (!currentUser) {
    return (
      <Container className="my-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading profile...</p>
      </Container>
    );
  }

  return (
    <Container className="my-4">
      <Row>
        <Col lg={4} md={5} className="mb-4 mb-md-0">
          <Card className="shadow-sm">
            <Card.Body>
              <div className="text-center mb-4">
                <div className="bg-primary text-white rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center"
                  style={{
                    width: "100px",
                    height: "100px",
                    fontSize: "2.5rem",
                    overflow: "hidden",
                  }}>
                  {currentUser.picture ? (
                    <img
                    src={`http://localhost:5000/uploads/profile_pictures/${currentUser.picture}`}
                      alt="Profile"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    currentUser.first_name.charAt(0).toUpperCase()
                  )}
                </div>

                <h4>{currentUser.first_name} {currentUser.last_name}</h4>
                <p className="text-muted">{currentUser.email}</p>
                <p className="text-muted small">
                  Member since{" "}
                  {new Date(currentUser.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                  })}
                </p>
              </div>
            </Card.Body>
          </Card>

          {/*Wishlist Section */}
          <Card className="shadow-sm mt-4">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">Your Wishlist</h5>
                <Badge pill bg="primary">
                  {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'}
                </Badge>
              </div>
              
              {wishlistLoading ? (
                <div className="text-center my-4">
                  <Spinner animation="border" size="sm" variant="primary" />
                </div>
              ) : wishlist.length === 0 ? (
                <Alert variant="light" className="text-center mb-0">
                  <i className="fas fa-book-open fa-2x mb-3 text-muted"></i>
                  <p className="mb-0">Your wishlist is empty</p>
                  <p className="small mt-2">
                    Add books from book details pages
                  </p>
                </Alert>
              ) : (
                <Accordion flush>
                  {wishlist.map((item, index) => (
                    <Accordion.Item eventKey={index.toString()} key={item.id || index} className="mb-2 border-0">
                      <Accordion.Header className="p-2">
                        <div className="d-flex flex-column w-100">
                          <div className="flex-grow-1">
                            <h6 className="mb-0 text-truncate">{item.BookTitle}</h6>
                            <small className="text-muted">{item.Genre}</small>
                          </div>
                        </div>
                      </Accordion.Header>
                      <Accordion.Body className="p-3 bg-light rounded">
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <p className="mb-1">
                              <strong>Author:</strong> {item.Author || "Unknown"}
                            </p>
                            {item.Created_At && (
                              <p className="mb-1 small text-muted">
                                Added on: {new Date(item.Created_At).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFromWishlist(item.WishListID);
                            }}
                            disabled={wishlistLoading}
                          >
                            <i className="fas fa-trash"></i>
                          </Button>
                        </div>
                        {item.Book_ID && (
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="mt-2"
                            as={Link}
                            to={`/books/${item.Book_ID}`}
                          >
                            <i className="fas fa-eye me-1"></i> View Book
                          </Button>
                        )}
                      </Accordion.Body>
                    </Accordion.Item>
                  ))}
                </Accordion>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={8} md={7}>
          <Card className="shadow-sm">
            <Card.Body>
              <h4 className="mb-4">Edit Profile</h4>
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}

              <Form onSubmit={(e) => {
                e.preventDefault();
                updateProfile({
                  first_name: e.target.first_name.value,
                  last_name: e.target.last_name.value,
                  address: e.target.address.value
                }).then(() => {
                  setSuccess("Profile updated successfully");
                  setTimeout(() => setSuccess(""), 3000);
                }).catch(err => {
                  setError(err.message);
                });
              }}>
                <Form.Group className="mb-3">
                  <Form.Label>First Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="first_name"
                    defaultValue={currentUser.first_name}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Last Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="last_name"
                    defaultValue={currentUser.last_name}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    defaultValue={currentUser.email}
                    disabled
                  />
                  <Form.Text className="text-muted">
                    Email address cannot be changed
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Address</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    name="address"
                    defaultValue={currentUser.address}
                    required
                  />
                </Form.Group>

                <div className="d-flex justify-content-between">
                  <Link to="/dashboard" className="btn btn-secondary">
                    <i className="fas fa-arrow-left me-2"></i>Back to Dashboard
                  </Link>
                  <Button variant="primary" type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <Spinner as="span" animation="border" size="sm" className="me-2" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ProfilePage;