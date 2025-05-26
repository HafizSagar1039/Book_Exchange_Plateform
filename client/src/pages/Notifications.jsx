import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, Spinner, Alert } from "react-bootstrap";
 const { token } = useAuth();
const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("/api/notifications", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then((res) => {
      setNotifications(res.data);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <Spinner animation="border" className="mt-4" />;
  }

  return (
    <div className="mt-4">
      <h4>Notifications</h4>
      {notifications.length === 0 ? (
        <Alert variant="info">No notifications yet.</Alert>
      ) : (
        notifications.map((n) => (
          <Card key={n.id} className="mb-3 shadow-sm border-0 rounded-4 p-3">
            <Card.Text>{n.message}</Card.Text>
            <small className="text-muted">{new Date(n.created_at).toLocaleString()}</small>
          </Card>
        ))
      )}
    </div>
  );
};

export default Notifications;
