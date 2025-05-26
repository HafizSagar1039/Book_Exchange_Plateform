import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer mt-auto py-4 bg-dark text-white">
      <Container>
        <Row className="py-3">
          <Col md={4} className="mb-4 mb-md-0">
            <h5 className="mb-3">BookBridge</h5>
            <p className="mb-3">
              A community platform for book lovers to exchange, share, and discover new books.
            </p>
            <div className="social-icons">
              <a href="#" className="text-white me-3">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="text-white me-3">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="text-white me-3">
                <i className="fab fa-instagram"></i>
              </a>
            </div>
          </Col>
          
          <Col md={4} className="mb-4 mb-md-0">
            <h5 className="mb-3">Quick Links</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/" className="text-white text-decoration-none">
                  <i className="fas fa-angle-right me-2"></i> Home
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/add-book" className="text-white text-decoration-none">
                  <i className="fas fa-angle-right me-2"></i> Add Book
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/dashboard" className="text-white text-decoration-none">
                  <i className="fas fa-angle-right me-2"></i> Dashboard
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/profile" className="text-white text-decoration-none">
                  <i className="fas fa-angle-right me-2"></i> Profile
                </Link>
              </li>
            </ul>
          </Col>
          
          <Col md={4}>
            <h5 className="mb-3">Contact Us</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <i className="fas fa-map-marker-alt me-2"></i> Ichra Road , Lahore , Pakistan
              </li>
              <li className="mb-2">
                <i className="fas fa-envelope me-2"></i> tufailahmedsagar1039@gmail.com
              </li>
              <li className="mb-2">
                <i className="fas fa-phone me-2"></i> (+92) 317-4512095
              </li>
            </ul>
          </Col>
        </Row>
        
        <hr className="my-4 bg-light" />
        
        <Row>
          <Col className="text-center">
            <p className="mb-0">
              &copy; {currentYear} BookBridge. All rights reserved.
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;