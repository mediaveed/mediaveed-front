import React, { useState } from "react";
import { Form, Button, InputGroup } from "react-bootstrap";
import { Send, Link2 } from "lucide-react";
import "./components.css";

const UrlInput = ({ url, setUrl, onSubmit }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <Form
      onSubmit={onSubmit}
      className="d-flex justify-content-center align-items-center mt-4"
    >
      <InputGroup
        style={{
          maxWidth: "650px",
          width: "100%",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            display: "flex",
            alignItems: "center",
          }}
        >
          {/* Icon inside input */}
          <Link2
            size={20}
            style={{
              position: "absolute",
              left: "1.2rem",
              color: isFocused ? "#3b82f6" : "#6b7280",
              transition: "color 0.3s ease",
              zIndex: 2,
              marginRight: "19px"
            }}
          />

          <Form.Control
            type="url"
            placeholder="Paste video link here"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="url-input"
            style={{
              background: "rgba(31, 41, 55, 0.95)",
              border: `2px solid ${isFocused ? "rgba(59, 130, 246, 0.6)" : "rgba(59, 130, 246, 0.3)"}`,
              borderTopLeftRadius: "14px",
              borderBottomLeftRadius: "14px",
              borderRight: "none",
              color: "white",
              padding: "1rem 1.2rem 1rem 3rem",
              fontSize: "1rem",
              letterSpacing: "0.3px",
              transition: "all 0.3s ease",
              boxShadow: isFocused
                ? "0 0 0 4px rgba(59, 130, 246, 0.1), 0 8px 25px rgba(0, 0, 0, 0.3)"
                : "0 4px 15px rgba(0, 0, 0, 0.2)",
            }}
          />

          <Button
            type="submit"
            variant="primary"
            style={{
              background: url.trim()
                ? "linear-gradient(135deg, #3b82f6, #6366f1)"
                : "linear-gradient(135deg, rgba(59, 130, 246, 0.6), rgba(99, 102, 241, 0.6))",
              border: "none",
              padding: "1rem 1.8rem",
              borderTopRightRadius: "14px",
              borderBottomRightRadius: "14px",
              fontWeight: "600",
              letterSpacing: "0.5px",
              textTransform: "uppercase",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              fontSize: "0.95rem",
              transition: "all 0.3s ease",
              boxShadow: url.trim()
                ? "0 4px 15px rgba(59, 130, 246, 0.4)"
                : "0 4px 15px rgba(59, 130, 246, 0.2)",
              cursor: url.trim() ? "pointer" : "not-allowed",
              opacity: url.trim() ? 1 : 0.7,
            }}
            onMouseEnter={(e) => {
              if (url.trim()) {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 6px 20px rgba(59, 130, 246, 0.5)";
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = url.trim()
                ? "0 4px 15px rgba(59, 130, 246, 0.4)"
                : "0 4px 15px rgba(59, 130, 246, 0.2)";
            }}
          >
            <span>Enter</span>
            <Send size={18} />
          </Button>
        </div>
      </InputGroup>

    </Form>
  );
};

export default UrlInput;
