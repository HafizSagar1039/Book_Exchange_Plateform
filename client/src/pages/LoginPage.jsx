import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Card, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState('');

  const { login, forgotPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm();

  const {
    register: registerForgot,
    handleSubmit: handleForgotSubmit,
    formState: { errors: forgotErrors },
    reset: resetForgot
  } = useForm();

  const onLogin = async (data) => {
    const { email, password } = data;
    try {
      setError('');
      setLoading(true);
      await login(email, password);
      navigate(from);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to log in');
    } finally {
      setLoading(false);
    }
  };

  const onForgotPassword = async (data) => {
    const { email } = data;
    try {
      setError('');
      setLoading(true);
      await forgotPassword(email);
      setForgotSuccess('Password reset instructions sent to your email');
      resetForgot();
      setTimeout(() => {
        setShowForgotPassword(false);
        setForgotSuccess('');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset instructions');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Row className="justify-content-center">
        <Col md={6} lg={5}>
          {!showForgotPassword ? (
            <>
              <div className="text-center mb-4">
                <h1 className="h3">Login Page</h1>
                <p className="text-muted">Sign in to access your account</p>
              </div>

              <Card className="shadow-sm">
                <Card.Body className="p-4">
                  {error && <Alert variant="danger">{error}</Alert>}
                  <Form onSubmit={handleSubmit(onLogin)}>
                    <Form.Group className="mb-3" controlId="email">
                      <Form.Label>Email Address</Form.Label>
                      <Form.Control
                        type="email"
                        placeholder="Enter your email"
                        {...register('email', { required: 'Email is required' })}
                      />
                      {errors.email && (
                        <small className="text-danger">{errors.email.message}</small>
                      )}
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="password">
                      <Form.Label>Password</Form.Label>
                      <Form.Control
                        type="password"
                        placeholder="Enter your password"
                        {...register('password', { required: 'Password is required' })}
                      />
                      {errors.password && (
                        <small className="text-danger">{errors.password.message}</small>
                      )}
                    </Form.Group>

                    <div className="d-flex justify-content-end align-items-center mb-4">
                      <Button
                        variant="link"
                        className="p-0"
                        onClick={() => setShowForgotPassword(true)}
                      >
                        <small>Forgot Password?</small>
                      </Button>
                    </div>

                    <Button
                      variant="primary"
                      type="submit"
                      className="w-100"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Signing in...
                        </>
                      ) : (
                        'Sign In'
                      )}
                    </Button>
                  </Form>

                  <div className="text-center mt-4">
                    <p className="mb-0">
                      Don't have an account?{' '}
                      <Link to="/register" className="text-decoration-none">
                        Sign up
                      </Link>
                    </p>
                  </div>
                </Card.Body>
              </Card>
            </>
          ) : (
            <>
              <div className="text-center mb-4">
                <h1 className="h3">Reset Password</h1>
                <p className="text-muted">Enter your email to reset your password</p>
              </div>

              <Card className="shadow-sm">
                <Card.Body className="p-4">
                  {error && <Alert variant="danger">{error}</Alert>}
                  {forgotSuccess && <Alert variant="success">{forgotSuccess}</Alert>}

                  <Form onSubmit={handleForgotSubmit(onForgotPassword)}>
                    <Form.Group className="mb-3" controlId="forgotEmail">
                      <Form.Label>Email Address</Form.Label>
                      <Form.Control
                        type="email"
                        placeholder="Enter your email"
                        {...registerForgot('email', { required: 'Email is required' })}
                      />
                      {forgotErrors.email && (
                        <small className="text-danger">{forgotErrors.email.message}</small>
                      )}
                    </Form.Group>

                    <Button
                      variant="primary"
                      type="submit"
                      className="w-100 mb-3"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Sending...
                        </>
                      ) : (
                        'Reset Password'
                      )}
                    </Button>

                    <Button
                      variant="outline-secondary"
                      className="w-100"
                      onClick={() => setShowForgotPassword(false)}
                    >
                      Back to Login
                    </Button>
                  </Form>
                </Card.Body>
              </Card>
            </>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default LoginPage;