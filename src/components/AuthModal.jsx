import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Modal, Form, Button, Alert } from 'react-bootstrap';
import { signup, login } from '../api/auth';

const AuthModal = ({ show, mode, onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [remember, setRemember] = useState(false);

  const resetState = () => {
    setName('');
    setEmail('');
    setPassword('');
    setError('');
    setLoading(false);
    setRemember(false);
  };

  const handleHide = () => {
    if (!loading) {
      resetState();
      onClose();
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload =
        mode === 'signup'
          ? await signup({ name, email, password })
          : await login({ email, password });
      onSuccess?.({ ...payload, remember });
      resetState();
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const title = mode === 'signup' ? 'Create your account' : 'Sign in to continue';

  return (
    <Modal show={show} onHide={handleHide} centered dialogClassName="auth-modal" contentClassName="auth-modal-content">
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {mode === 'signup' && (
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </Form.Group>
          )}
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={6}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              id="remember-me"
              label="Remember me for 30 days"
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
            />
          </Form.Group>
          {error && <Alert variant="danger">{error}</Alert>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleHide} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Please wait…' : mode === 'signup' ? 'Sign up' : 'Sign in'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

AuthModal.propTypes = {
  show: PropTypes.bool,
  mode: PropTypes.oneOf(['signup', 'login']),
  onClose: PropTypes.func,
  onSuccess: PropTypes.func,
};

AuthModal.defaultProps = {
  show: false,
  mode: 'login',
  onClose: () => {},
  onSuccess: () => {},
};

export default AuthModal;
