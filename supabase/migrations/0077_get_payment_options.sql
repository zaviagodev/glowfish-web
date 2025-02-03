-- Drop the function if it exists
DROP FUNCTION IF EXISTS public.get_payment_options;

-- Create the function
CREATE OR REPLACE FUNCTION public.get_payment_options(store text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    payment_settings record;
    bank_accounts jsonb[];
    result jsonb;
BEGIN
    -- Get payment settings
    SELECT * INTO payment_settings
    FROM payment_settings
    WHERE store_name = store;

    -- If no payment settings found, return null
    IF NOT FOUND THEN
        RETURN NULL;
    END IF;

    -- Initialize result
    result = jsonb_build_object(
        'promptpay', NULL,
        'bank_transfer', NULL
    );

    -- Add PromptPay details if enabled
    IF payment_settings.promptpay_enabled THEN
        result = jsonb_set(
            result,
            '{promptpay}',
            jsonb_build_object(
                'id', payment_settings.promptpay_id,
                'name', payment_settings.promptpay_name,
                'qr_code', payment_settings.promptpay_qr_code_url,
                'bank', (
                    SELECT jsonb_build_object(
                        'bank_code', bank_code,
                        'bank_name', bank_name,
                        'bank_name_thai', bank_name_thai,
                        'image_url', image_url
                    )
                    FROM banks
                    WHERE bank_code = 'PROMPTPAY'
                )
            )
        );
    END IF;

    -- Add bank transfer details if enabled
    IF payment_settings.bank_transfer_enabled THEN
        -- Get bank accounts with bank details
        SELECT array_agg(
            jsonb_build_object(
                'id', account->>'id',
                'account_name', account->>'accountName',
                'account_number', account->>'accountNumber',
                'branch', account->>'branch',
                'is_default', account->>'isDefault',
                'bank', (
                    SELECT jsonb_build_object(
                        'bank_code', bank_code,
                        'bank_name', bank_name,
                        'bank_name_thai', bank_name_thai,
                        'swift_code', swift_code,
                        'image_url', image_url
                    )
                    FROM banks
                    WHERE bank_code = account->>'bankName'
                )
            )
        )
        INTO bank_accounts
        FROM jsonb_array_elements(payment_settings.bank_accounts) as account;

        result = jsonb_set(
            result,
            '{bank_transfer}',
            jsonb_build_object(
                'accounts', COALESCE(to_jsonb(bank_accounts), '[]'::jsonb)
            )
        );
    END IF;

    RETURN result;
END;
$$;

-- Grant execute permission to public
GRANT EXECUTE ON FUNCTION public.get_payment_options TO public;

-- Add helpful comment
COMMENT ON FUNCTION public.get_payment_options IS 'Get payment options (PromptPay and bank accounts) for a store'; 