import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import config from "../config";

const API_URL = config.BOOK_IMAGES_URL;

const EditBookPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [initialLoad, setInitialLoad] = useState(true);
  const [currentImage, setCurrentImage] = useState(null); // Track current image

  const { getBookById, updateBook, loading } = useBooks();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm();

  const genres = [
    "Fiction",
    "Non-Fiction",
    "Mystery",
    "Romance",
    "Science Fiction",
    "Fantasy",
    "Biography",
    "History",
    "Self-Help",
    "Children",
    "Young Adult",
    "Business",
    "Cooking",
    "Art",
    "Travel",
  ];

  const conditions = ["Available", "Reserved"];

  // Load book data
  useEffect(() => {
    const fetchBook = async () => {
      try {
        const book = await getBookById(id);

        setValue("title", book.Title);
        setValue("author", book.Author);
        setValue("genre", book.Genre);
        setValue("condition", book.book_condition);
        setValue("description", book.description);

        if (book.BookImage) {
          const imageUrl = `${API_URL}${book.BookImage}`;
          setPreview(imageUrl);
          setCurrentImage(book.BookImage); // Store current image name
        }

        setInitialLoad(false);
      } catch (err) {
        setError("Failed to load book details. Please try again.");
        console.error(err);
      }
    };

    fetchBook();
  }, [id, getBookById, setValue]);

  // Watch file input to show preview
  const watchImage = watch("image");
  useEffect(() => {
    const file = watchImage?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size should not exceed 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  }, [watchImage]);

  const onSubmit = async (data) => {
    try {
      setError("");

      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("author", data.author);
      formData.append("genre", data.genre);
      formData.append("condition", data.condition);
      formData.append("description", data.description);

      if (data.image?.[0]) {
        formData.append("image", data.image[0]); // append new file
      } else if (currentImage) {
        // If no new image selected, append the current image name
        formData.append("currentImage", currentImage);
      }

      await updateBook(id, formData);
      navigate(`/books/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update book");
    }
  };

  if (initialLoad) {
    return (
      <Container className="my-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading book details...</p>
      </Container>
    );
  }

  return (
    <Container className="my-4">
      <Row className="justify-content-center">
        <Col lg={8}>
          <Card className="shadow-sm">
            <Card.Body className="p-4">
              <h2 className="mb-4 text-center">Edit Book</h2>

              {error && <Alert variant="danger">{error}</Alert>}

              <Form
                onSubmit={handleSubmit(onSubmit)}
                encType="multipart/form-data"
              >
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="title">
                      <Form.Label>Book Title</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter book title"
                        {...register("title", {
                          required: "Title is required",
                        })}
                        isInvalid={!!errors.title}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.title?.message}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="author">
                      <Form.Label>Author</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter author name"
                        {...register("author", {
                          required: "Author is required",
                        })}
                        isInvalid={!!errors.author}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.author?.message}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="genre">
                      <Form.Label>Genre</Form.Label>
                      <Form.Select
                        {...register("genre", {
                          required: "Genre is required",
                        })}
                        isInvalid={!!errors.genre}
                      >
                        <option value="">Select Genre</option>
                        {genres.map((g, i) => (
                          <option key={i} value={g}>
                            {g}
                          </option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors.genre?.message}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="condition">
                      <Form.Label>Condition</Form.Label>
                      <Form.Select
                        {...register("condition", {
                          required: "Condition is required",
                        })}
                        isInvalid={!!errors.condition}
                      >
                        <option value="">Select Condition</option>
                        {conditions.map((c, i) => (
                          <option key={i} value={c}>
                            {c}
                          </option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors.condition?.message}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3" controlId="description">
                  <Form.Label>Description*</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    placeholder="Enter book description"
                    {...register("description", {
                      required: "Description is required",
                    })}
                    isInvalid={!!errors.description}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.description?.message}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3" controlId="image">
                  <Form.Label>Book Cover Image</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    {...register("image")}
                  />
                  <Form.Text className="text-muted">
                    Max file size: 5MB. Leave empty to keep existing image.
                  </Form.Text>
                  {preview && (
                    <div className="mt-3 text-center">
                      <img
                        src={preview}
                        alt="Book preview"
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
                  <Button variant="primary" type="submit">
                    "Update Book"
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

export default EditBookPage;
