import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Button, Alert, Spinner } from 'react-bootstrap';
import { useExchange } from '../context/ExchangeContext';
import { useAuth } from '../context/AuthContext';
import defaultBookCover from '../assets/cover.jpg';

const ExchangePage = () => {
  const { id } = useParams();
  const [exchange, setExchange] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { getExchangeById, respondToExchange } = useExchange();
  const { currentUser } = useAuth();

  // Fetch exchange details
  useEffect(() => {
    const fetchExchange = async () => {
      try {
        setLoading(true);
        setError('');
        
        const exchangeData = await getExchangeById(id);
        setExchange(exchangeData);
      } catch (err) {
        setError('Failed to load exchange details. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchExchange();
  }, [id, getExchangeById]);

  // Handle respond to exchange
  const handleRespond = async (status) => {
    try {
      setLoading(true);
      await respondToExchange(exchange.id, status);
      
      // Update local exchange state
      setExchange({
        ...exchange,
        status
      });
    } catch (error) {
      console.error('Error responding to exchange:', error);
      setError('Failed to update exchange status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Container className="my-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading exchange details...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="my-5">
        <Alert variant="danger">{error}</Alert>
        <div className="text-center mt-3">
          <Button as={Link} to="/dashboard" variant="outline-primary">
            Back to Dashboard
          </Button>
        </div>
      </Container>
    );
  }

  const isOwner = currentUser.id === exchange.owner_id;

  return (
    <Container className="my-4">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="shadow-sm">
            <Card.Header className="bg-primary text-white py-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="mb-0">
                    <i className="fas fa-exchange-alt me-2"></i>
                    Exchange Request
                  </h5>
                </div>
                <div>
                  <Button 
                    as={Link} 
                    to="/dashboard" 
                    variant="outline-light" 
                    size="sm"
                  >
                    Back to Dashboard
                  </Button>
                </div>
              </div>
            </Card.Header>
            
            <Card.Body>
              <div className="mb-4">
                <h6 className="text-muted mb-3">Request Status</h6>
                <div className="d-flex align-items-center">
                  <Badge 
                    bg={
                      exchange.status === 'approved' ? 'success' :
                      exchange.status === 'rejected' ? 'danger' : 'warning'
                    }
                    className="p-2"
                  >
                    {exchange.status.toUpperCase()}
                  </Badge>
                  
                  <span className="ms-3">
                    {exchange.status === 'pending' && 'Awaiting response from book owner'}
                    {exchange.status === 'approved' && 'Exchange request has been approved!'}
                    {exchange.status === 'rejected' && 'Exchange request has been declined'}
                  </span>
                </div>
              </div>
              
              <Row className="mb-4">
                <Col md={6}>
                  <h6 className="text-muted mb-3">Book Information</h6>
                  <div className="d-flex">
                    <div style={{ width: '80px', height: '120px' }} className="me-3">
                      <img 
                        src={exchange.image || defaultBookCover} 
                        alt={exchange.title}
                        className="img-fluid rounded"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = defaultBookCover;
                        }}
                      />
                    </div>
                    <div>
                      <h5 className="mb-1">
                        <Link to={`/books/${exchange.book_id}`} className="text-decoration-none">
                          {exchange.title}
                        </Link>
                      </h5>
                      <p className="text-muted mb-2">by {exchange.author}</p>
                      <p className="mb-0 small">
                        Request sent on: <br />
                        {formatDate(exchange.created_at)}
                      </p>
                    </div>
                  </div>
                </Col>
                
                <Col md={6}>
                  <h6 className="text-muted mb-3">Exchange Participants</h6>
                  <div className="mb-3">
                    <p className="mb-1">
                      <strong>Book Owner:</strong>
                    </p>
                    <p className="mb-0">
                      {exchange.owner_name} <br />
                      <small className="text-muted">{exchange.owner_email}</small>
                    </p>
                  </div>
                  
                  <div>
                    <p className="mb-1">
                      <strong>Requester:</strong>
                    </p>
                    <p className="mb-0">
                      {exchange.requester_name} <br />
                      <small className="text-muted">{exchange.requester_email}</small>
                    </p>
                  </div>
                </Col>
              </Row>
              
              <div className="mb-4">
                <h6 className="text-muted mb-3">Request Message</h6>
                <Card className="bg-light">
                  <Card.Body>
                    <p className="mb-0">{exchange.message}</p>
                  </Card.Body>
                </Card>
              </div>
              
              <div className="d-flex justify-content-between">
                <Button 
                  as={Link}
                  to={`/messages/${exchange.id}`}
                  variant="primary"
                >
                  <i className="fas fa-comment-alt me-2"></i> Open Messages
                </Button>
                
                {isOwner && exchange.status === 'pending' && (
                  <div>
                    <Button 
                      variant="danger" 
                      className="me-2"
                      onClick={() => handleRespond('rejected')}
                    >
                      <i className="fas fa-times me-2"></i> Decline
                    </Button>
                    
                    <Button 
                      variant="success"
                      onClick={() => handleRespond('approved')}
                    >
                      <i className="fas fa-check me-2"></i> Approve
                    </Button>
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
          
          {(exchange.status === 'approved') && (
            <Alert variant="info" className="mt-4">
              <h6>What's Next?</h6>
              <p>
                This exchange has been approved. You can now coordinate the details of your book exchange 
                through the messaging system. Be sure to discuss:
              </p>
              <ul>
                <li>A meeting location (public place recommended)</li>
                <li>Date and time for the exchange</li>
                <li>Contact information for the day of the exchange</li>
              </ul>
              <p className="mb-0">
                <i className="fas fa-exclamation-circle me-2"></i>
                Remember to always prioritize safety when conducting in-person exchanges.
              </p>
            </Alert>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default ExchangePage;