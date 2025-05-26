import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Form,
  Button,
  Row,
  Col,
  Card,
  Spinner,
  Alert,
} from "react-bootstrap";
import { useForm } from "react-hook-form";
import { useBooks } from "../context/BooksContext";

const AddBookPage = () => {
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { addBook, loading } = useBooks();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // List of genres and conditions
  const genres = [
    "Biography",
    "History",
    "Children",
    "Young Adult",
    "Business",
    "Cooking",
    "Art",
    "Travel",
    "others",
  ];

  const conditions = ["Available", "Reserved"];

  // Handle image preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setError('Image size should not exceed 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async (data) => {
    try {
      setError("");
      const formData = new FormData();

      formData.append("title", data.title);
      formData.append("author", data.author);
      formData.append("genre", data.genre);
      formData.append("condition", data.condition);
      formData.append("description", data.description);

      // ✅ Append picture (your logic)
      if (data.picture && data.picture.length > 0) {
        formData.append("picture", data.picture[0]);
      }

      // Add book to database
      const addedBook = await addBook(formData);

      navigate(`/books/${addedBook.id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add book");
    }
  };

  return (
    <Container className="my-4">
      <Row className="justify-content-center">
        <Col lg={8}>
          <Card className="shadow-sm">
            <Card.Body className="p-4">
              <h2 className="mb-4 text-center">Add a New Book</h2>

              {error && <Alert variant="danger">{error}</Alert>}

              <Form onSubmit={handleSubmit(onSubmit)}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="title">
                      <Form.Label>Book Title*</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter book title"
                        {...register("title", {
                          required: "Title is required",
                        })}
                        isInvalid={!!errors.title}
                      />
                      {errors.title && (
                        <Form.Control.Feedback type="invalid">
                          {errors.title.message}
                        </Form.Control.Feedback>
                      )}
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="author">
                      <Form.Label>Author*</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter author name"
                        {...register("author", {
                          required: "Author is required",
                        })}
                        isInvalid={!!errors.author}
                      />
                      {errors.author && (
                        <Form.Control.Feedback type="invalid">
                          {errors.author.message}
                        </Form.Control.Feedback>
                      )}
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="genre">
                      <Form.Label>Genre*</Form.Label>
                      <Form.Select
                        {...register("genre", {
                          required: "Genre is required",
                        })}
                        isInvalid={!!errors.genre}
                      >
                        <option value="">Select Genre</option>
                        {genres.map((genre, index) => (
                          <option key={index} value={genre}>
                            {genre}
                          </option>
                        ))}
                      </Form.Select>
                      {errors.genre && (
                        <Form.Control.Feedback type="invalid">
                          {errors.genre.message}
                        </Form.Control.Feedback>
                      )}
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="condition">
                      <Form.Label>Condition*</Form.Label>
                      <Form.Select
                        {...register("condition", {
                          required: "Condition is required",
                        })}
                        isInvalid={!!errors.condition}
                      >
                        <option value="">Select Condition</option>
                        {conditions.map((condition, index) => (
                          <option key={index} value={condition}>
                            {condition}
                          </option>
                        ))}
                      </Form.Select>
                      {errors.condition && (
                        <Form.Control.Feedback type="invalid">
                          {errors.condition.message}
                        </Form.Control.Feedback>
                      )}
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3" controlId="description">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    placeholder="Enter book description (Maximum 80 characters long)"
                    {...register("description", {
                      required: "Description is required",
                      maxLength:{
                        value:200,
                        message:"Description must be Maximum 50 characters Long"
                      }
                    })}
                    isInvalid={!!errors.description}
                  />
                  {errors.description && (
                    <Form.Control.Feedback type="invalid">
                      {errors.description.message}
                    </Form.Control.Feedback>
                  )}
                </Form.Group>

                <Form.Group className="mb-3" controlId="image">
                  <Form.Label>Book Cover Image</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    {...register("picture", { required: true })}
                    onChange={handleImageChange}
                  />
                  <Form.Text className="text-muted">
                    Maximum file size: 5MB. Recommended dimensions: 500x700px.
                  </Form.Text>

                  {preview && (
                    <div className="mt-3 text-center">
                      <img
                        src={preview}
                        alt="Book cover preview"
                        style={{
                          maxHeight: "200px",
                          maxWidth: "100%",
                          objectFit: "contain",
                        }}
                        className="border rounded"
                      />
                    </div>
                  )}
                </Form.Group>

                <div className="d-grid gap-2 mt-4">
                  <Button variant="primary" type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          className="me-2"
                        />
                        Adding Book...
                      </>
                    ) : (
                      "Add Book"
                    )}
                  </Button>
                  <Button
                    variant="outline-secondary"
                    onClick={() => navigate(-1)}
                  >
                    Cancel
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

export default AddBookPage;
