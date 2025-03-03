/*
# Drop Handle Signup Function

1. Changes
  - Drop handle_signup function as it's no longer needed
*/

-- Drop the function and its permissions
DROP FUNCTION IF EXISTS handle_signup(TEXT, TEXT, TEXT);
