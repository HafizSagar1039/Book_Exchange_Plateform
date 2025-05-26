import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, Button, Alert, Spinner, Row, Col } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { useAuth } from "../../context/AuthContext";

const RegisterForm = () => {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError("");

    try {
      // Create FormData and append all fields including the file
      const formData = new FormData();
      formData.append("firstName", data.firstName);
      formData.append("lastName", data.lastName);
      formData.append("username", data.username);
      formData.append("mobile", data.mobile);
      formData.append("email", data.email);
      formData.append("password", data.password);
      formData.append("address", data.address);

      if (data.picture && data.picture.length > 0) {
        formData.append("picture", data.picture[0]); // File input is an array
      }

      await registerUser(formData);
      navigate("/login");
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form
      onSubmit={handleSubmit(onSubmit)}
      className="p-4 bg-white rounded shadow-lg"
    >
      <div className="text-center mb-4">
        <h2 className="text-center">Create an Account</h2>
        <p className="text-muted">
          Create an account to start exchanging books
        </p>
      </div>
      {error && <Alert variant="danger">{error}</Alert>}

      {/* First Name & Last Name */}
      <Row className="mb-3">
        <Col md={6}>
          <Form.Group controlId="firstName">
            <Form.Label>First Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="John"
              {...register("firstName", { required: "First name is required" })}
              isInvalid={!!errors.firstName}
            />
            <Form.Control.Feedback type="invalid">
              {errors.firstName?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>

        <Col md={6}>
          <Form.Group controlId="lastName">
            <Form.Label>Last Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Doe"
              {...register("lastName", { required: "Last name is required" })}
              isInvalid={!!errors.lastName}
            />
            <Form.Control.Feedback type="invalid">
              {errors.lastName?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      {/* Username & Mobile */}
      <Row className="mb-3">
        <Col md={6}>
          <Form.Group controlId="username">
            <Form.Label>Username</Form.Label>
            <Form.Control
              type="text"
              placeholder="Username"
              {...register("username", { required: "Username is required" })}
              isInvalid={!!errors.username}
            />
            <Form.Control.Feedback type="invalid">
              {errors.username?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>

        <Col md={6}>
          <Form.Group controlId="mobile">
            <Form.Label>Mobile Number</Form.Label>
            <Form.Control
              type="text"
              placeholder="03XXXXXXXXX"
              {...register("mobile", {
                required: "Mobile number is required",
                pattern: {
                  value: /^03[0-9]{9}$/,
                  message: "Invalid mobile number",
                },
              })}
              isInvalid={!!errors.mobile}
            />
            <Form.Control.Feedback type="invalid">
              {errors.mobile?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      {/* Email */}
      <Form.Group className="mb-3" controlId="email">
        <Form.Label>Email Address</Form.Label>
        <Form.Control
          type="email"
          placeholder="example@domain.com"
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: "Invalid email address",
            },
          })}
          isInvalid={!!errors.email}
        />
        <Form.Control.Feedback type="invalid">
          {errors.email?.message}
        </Form.Control.Feedback>
      </Form.Group>

      {/* Password */}
      <Row className="mb-3">
        <Col md={6}>
          <Form.Group controlId="password">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter a strong password"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              })}
              isInvalid={!!errors.password}
            />
            <Form.Control.Feedback type="invalid">
              {errors.password?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>

        <Col md={6}>
          <Form.Group controlId="picture">
            <Form.Label>Picture</Form.Label>
            <Form.Control
              type="file"
              accept="image/*"
              {...register("picture", { required: "image is required" })}
              isInvalid={!!errors.picture}
            />
            <Form.Control.Feedback type="invalid">
              {errors.picture?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      {/* Address */}
      <Form.Group className="mb-3" controlId="address">
        <Form.Label>Address</Form.Label>
        <Form.Control
          type="text"
          placeholder="Address"
          {...register("address", { required: "Address is required",
            maxLength:{
              value:50,
              message:"The Adress Not Exceed to 30 Characters"
            }
           })}
          isInvalid={!!errors.address}
        />
        <Form.Control.Feedback type="invalid">
          {errors.address?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Button
        variant="primary"
        type="submit"
        className="w-100 mt-3"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Spinner as="span" animation="border" size="sm" className="me-2" />
            Registering...
          </>
        ) : (
          "Register"
        )}
      </Button>

      <p className="text-center mt-3 mb-0">
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </Form>
  );
};

export default RegisterForm;
