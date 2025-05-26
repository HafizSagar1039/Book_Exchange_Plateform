import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Spinner, Alert } from 'react-bootstrap';
import { useExchange } from '../context/ExchangeContext';
import { useAuth } from '../context/AuthContext';
import defaultBookCover from '../assets/cover.jpg';

const MessagingPage = () => {
  const { exchangeId } = useParams();
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);

  const [exchange, setExchange] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { getExchangeById, getMessages, sendMessage } = useExchange();
  const { currentUser } = useAuth();

  // Load exchange info
  const fetchExchange = useCallback(async () => {
    try {
      const data = await getExchangeById(exchangeId);
      setExchange(data);
    } catch (err) {
      setError('Failed to load exchange details');
      console.error(err);
    }
  }, [exchangeId, getExchangeById]);

  // Load messages
  const fetchMessages = useCallback(async () => {
    try {
      const data = await getMessages(exchangeId);
      setMessages(data);
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  }, [exchangeId, getMessages]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      await Promise.all([fetchExchange(), fetchMessages()]);
      setLoading(false);
    }
    loadData();
  }, [fetchExchange, fetchMessages]);

  // Poll new messages every 10 seconds
  useEffect(() => {
    const intervalId = setInterval(fetchMessages, 10000);
    return () => clearInterval(intervalId);
  }, [fetchMessages]);

  // Scroll only if user near bottom (threshold 150px)
  const scrollToBottomIfNearBottom = () => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const threshold = 150; // px within bottom to auto scroll
    const scrollPositionFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;

    if (scrollPositionFromBottom < threshold) {
      container.scrollTop = container.scrollHeight;
    }
  };

  // Use effect runs on messages update
  useEffect(() => {
    scrollToBottomIfNearBottom();
  }, [messages]);

  // Format date/time helpers
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    if (isNaN(date)) return 'Invalid Date';
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date)) return 'Invalid Date';
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Send message handler
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      const sentMessage = await sendMessage(exchangeId, message);
      setMessages((prev) => [...prev, sentMessage]);
      setMessage('');
      inputRef.current?.focus();

      // Scroll immediately to bottom after sending new message
      setTimeout(() => {
        const container = messagesContainerRef.current;
        if (container) container.scrollTop = container.scrollHeight;
      }, 50);
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  if (loading && !exchange) {
    return (
      <Container className="my-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading messages...</p>
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

  return (
    <Container className="my-4" style={{ maxWidth: '700px', paddingBottom: '80px' }}>
      <Row>
        <Col className="mx-auto">
          <Card className="shadow" style={{ borderRadius: '12px', border: 'none' }}>
            {/* Header */}
            <Card.Header
              className="bg-primary text-white py-3 d-flex justify-content-between align-items-center"
              style={{ borderRadius: '12px 12px 0 0' }}
            >
              <h5 className="mb-0">
                <i className="fas fa-comment-alt me-2"></i>Exchange Messages
              </h5>
              <Button as={Link} to="/dashboard" variant="outline-light" size="sm">
                Back
              </Button>
            </Card.Header>

            <Card.Body className="p-0 d-flex flex-column" style={{ minHeight: '600px', backgroundColor: '#f9fafb' }}>
              {exchange && (
                <>
                  {/* Exchange info */}
                  <div
                    className="p-3 bg-white border-bottom d-flex align-items-center gap-3"
                    style={{ borderRadius: '0 0 12px 12px' }}
                  >
                    <img
                       src={`http://localhost:5000/uploads/profile_pictures/${currentUser.picture}`}
                      alt={exchange.Title}
                      style={{ width: 70, height: 70, objectFit: 'cover', borderRadius: '10px' }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = defaultBookCover;
                      }}
                    />
                    <div className="flex-grow-1">
                      <Link to={`/books/${exchange.BookID}`} className="text-decoration-none fs-6 fw-semibold text-dark">
                        {exchange.Title}
                      </Link>
                      <p className="text-muted mb-1 small">by {exchange.Author}</p>
                      <div>
                        <span
                          className={`badge ${
                            exchange.book_condition === 'Approved'
                              ? 'bg-success'
                              : exchange.book_condition === 'Rejected'
                              ? 'bg-danger'
                              : 'bg-warning text-dark'
                          }`}
                        >
                          {exchange.book_condition
                            ? exchange.book_condition.charAt(0).toUpperCase() + exchange.book_condition.slice(1)
                            : 'Pending'}
                        </span>
                        <small className="text-muted ms-2">Requested on {formatDate(exchange.created_at)}</small>
                      </div>
                    </div>
                    <div className="text-end small text-muted" style={{ minWidth: '90px' }}>
                      <div>
                        <strong>{currentUser.id === exchange.requester_id ? 'Owner' : 'Requester'}</strong>
                      </div>
                      <div>{currentUser.id === exchange.requester_id ? exchange.owner_name : exchange.requester_name}</div>
                    </div>
                  </div>

                  {/* Messages container */}
                  <div
                    ref={messagesContainerRef}
                    className="p-4 flex-grow-1 overflow-auto"
                    style={{
                      backgroundColor: '#ffffff',
                      padding: '20px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '15px',
                      maxHeight: '470px',
                      borderTop: '1px solid #ddd',
                      borderBottom: '1px solid #ddd',
                      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                      scrollBehavior: 'smooth',
                      overscrollBehavior: 'contain',
                    }}
                  >
                    {messages.length === 0 ? (
                      <div className="text-center my-auto text-muted fst-italic" style={{ fontSize: '1.1rem' }}>
                        <i className="fas fa-comments fa-2x mb-3"></i>
                        No messages yet. Start the conversation!
                      </div>
                    ) : (
                      messages.map((msg, ind) => {
                        const isCurrentUser = msg.SenderID === currentUser.id;
                        return (
                          <div
                            key={msg.MessageID || ind}
                            style={{
                              maxWidth: '80%',
                              alignSelf: isCurrentUser ? 'flex-end' : 'flex-start',
                              backgroundColor: isCurrentUser ? '#dcf8c6' : '#f1f0f0',
                              padding: '12px 18px',
                              borderRadius: '18px',
                              boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                              position: 'relative',
                              fontSize: '0.95rem',
                              wordBreak: 'break-word',
                              lineHeight: 1.3,
                              color: '#202020',
                              display: 'inline-block',
                            }}
                          >
                            <div style={{ paddingRight: '50px' }}>{msg.MessageContent || msg.message || 'No message content'}</div>
                            <div
                              style={{
                                position: 'absolute',
                                right: '12px',
                                bottom: '6px',
                                fontSize: '0.7rem',
                                color: '#555',
                                fontWeight: '500',
                                userSelect: 'none',
                              }}
                              title={new Date(msg.Timestamp || msg.created_at || msg.timestamp).toLocaleString()}
                            >
                              {formatTime(msg.Timestamp || msg.created_at || msg.timestamp)}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Input box */}
                  <div
                    className="p-3 bg-white"
                    style={{ borderRadius: '0 0 12px 12px', borderTop: '1px solid #ddd' }}
                  >
                    <Form onSubmit={handleSendMessage} className="d-flex gap-2">
                      <Form.Control
                        ref={inputRef}
                        type="text"
                        placeholder="Type your message here..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        autoComplete="off"
                        aria-label="Message input"
                      />
                      <Button
                        type="submit"
                        variant="primary"
                        disabled={!message.trim()}
                        style={{ minWidth: '100px' }}
                      >
                        Send
                      </Button>
                    </Form>
                  </div>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default MessagingPage;
