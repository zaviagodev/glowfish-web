CREATE TABLE IF NOT EXISTS otp_requests (
  id SERIAL PRIMARY KEY,
  ip_address TEXT NOT NULL,
  last_request TIMESTAMP NOT NULL
);