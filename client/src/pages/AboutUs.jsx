import React from "react";
import { Container, Row, Col, Image, Button } from "react-bootstrap";

const AboutUs = () => {
  return (
    <Container className="my-5">
      <Row className="align-items-center">
        <Col md={6} className="mb-4 mb-md-0">
          <Image
            src="https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80"
            alt="Books exchange"
            fluid
            rounded
            style={{ boxShadow: "0 8px 16px rgba(0,0,0,0.15)" }}
          />
        </Col>
        <Col md={6}>
          <h2 className="mb-3" style={{ fontWeight: "700", color: "#2c3e50" }}>
            About Our Book Exchange Platform
          </h2>
          <p style={{ fontSize: "1.1rem", lineHeight: "1.6", color: "#34495e" }}>
            Welcome to <strong>Online Book Exchange Platform</strong> — a
            community-driven space designed to connect book lovers and empower
            readers worldwide. We make sharing and discovering books easy,
            secure, and fun.
          </p>
          <p style={{ fontSize: "1.1rem", lineHeight: "1.6", color: "#34495e" }}>
            Our mission is to foster a love of reading, support sustainable
            book sharing, and help books find new readers. Whether you're
            exchanging your cherished favorites or hunting for new adventures,
            you're in the right place.
          </p>
          <Button variant="primary" size="lg" href="/register" className="mt-3">
            Join the Community
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default AboutUs;
