import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import RegisterForm from '../components/forms/RegisterForm';

const RegisterPage = () => {
  return (
    <Container>
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          
          <RegisterForm />
        </Col>
      </Row>
    </Container>
  );
};

export default RegisterPage;