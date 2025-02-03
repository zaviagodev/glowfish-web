/*
# Add Ticket Attendance Points Trigger

1. Changes
  - Create trigger function to award attendance points when ticket status changes to 'used'
  - Delete points transaction when ticket status changes to 'unused'
  - Add trigger to tickets table
*/

-- Create trigger function
CREATE OR REPLACE FUNCTION award_ticket_attendance_points()
RETURNS TRIGGER AS $$
DECLARE
  v_customer_id UUID;
  v_event_id UUID;
  v_attendance_points INTEGER;
  v_store_name TEXT;
BEGIN
  -- Handle status change to 'used'
  IF (TG_OP = 'UPDATE' AND NEW.status = 'used' AND OLD.status != 'used') THEN
    -- Get event ID from ticket metadata
    v_event_id := (NEW.metadata->>'eventId')::UUID;
    
    -- Skip if no event ID in metadata
    IF v_event_id IS NULL THEN
      RETURN NEW;
    END IF;

    -- Get customer ID from order
    SELECT o.customer_id, o.store_name
    INTO v_customer_id, v_store_name
    FROM orders o
    WHERE o.id = NEW.order_id;

    -- Skip if no customer found
    IF v_customer_id IS NULL THEN
      RETURN NEW;
    END IF;

    -- Get attendance points from event
    SELECT e.attendance_points
    INTO v_attendance_points
    FROM events e
    WHERE e.id = v_event_id;

    -- Skip if no attendance points
    IF v_attendance_points IS NULL OR v_attendance_points = 0 THEN
      RETURN NEW;
    END IF;

    -- Check if points were already awarded for this ticket
    IF EXISTS (
      SELECT 1 
      FROM points_transactions pt 
      WHERE pt.description = 'Points earned for attending event #' || NEW.code
      AND pt.type = 'earn'
    ) THEN
      RETURN NEW;
    END IF;

    -- Insert points transaction
    INSERT INTO points_transactions (
      store_name,
      customer_id,
      order_id,
      points,
      type,
      description
    ) VALUES (
      v_store_name,
      v_customer_id,
      NEW.order_id,
      v_attendance_points,
      'earn',
      'Points earned for attending event #' || NEW.code
    );

  -- Handle status change to 'unused'
  ELSIF (TG_OP = 'UPDATE' AND NEW.status = 'unused' AND OLD.status = 'used') THEN
    -- Delete the corresponding points transaction
    DELETE FROM points_transactions
    WHERE description = 'Points earned for attending event #' || NEW.code
    AND type = 'earn'
    AND order_id = NEW.order_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS ticket_attendance_points_trigger ON tickets;
CREATE TRIGGER ticket_attendance_points_trigger
  AFTER UPDATE ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION award_ticket_attendance_points();

-- Add helpful comments
COMMENT ON FUNCTION award_ticket_attendance_points() IS 'Trigger function to award attendance points when ticket is marked as used and remove points when marked as unused'; 