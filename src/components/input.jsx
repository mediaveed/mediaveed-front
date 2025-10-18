import React from "react";
import { Form, Button, InputGroup } from "react-bootstrap";
import { Send } from "lucide-react";
import "./components.module.css";

const UrlInput = ({ url, setUrl, onSubmit }) => {
  return (
    <Form
      onSubmit={onSubmit}
      className="d-flex justify-content-center align-items-center mt-4"
    >
      <InputGroup style={{ maxWidth: "600px", width: "100%" }}>
        <Form.Control
          type="url"
          placeholder="Paste video link here (YouTube, TikTok, etc.)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="url-input"
          style={{
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.2)",
            borderTopLeftRadius: "10px",
            borderBottomLeftRadius: "10px",
            color: "white",
            padding: "0.9rem 1rem",
            fontSize: "1rem",
            letterSpacing: "0.3px",
          }}
        />
        <Button
          type="submit"
          variant="primary"
          style={{
            background: "linear-gradient(135deg, #22d3ee, #3b82f6)",
            border: "none",
            padding: "0.9rem 1.4rem",
            borderTopRightRadius: "10px",
            borderBottomRightRadius: "10px",
            fontWeight: "600",
            letterSpacing: "0.5px",
            textTransform: "uppercase",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
          }}
        >
          Enter
          <Send size={18} />
        </Button>
      </InputGroup>
    </Form>
  );
};

export default UrlInput;
