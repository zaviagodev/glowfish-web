-- Create banks table
CREATE TABLE IF NOT EXISTS public.banks (
    bank_code text PRIMARY KEY,
    bank_name_thai text NOT NULL,
    bank_name text NOT NULL,
    swift_code text NOT NULL,
    image_url text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.banks ENABLE ROW LEVEL SECURITY;

-- Create policy to allow dashboard users to view banks
CREATE POLICY "Allow dashboard users to view banks" ON public.banks
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
        )
    );

-- Create policy to allow dashboard users to update banks
CREATE POLICY "Allow dashboard users to update banks" ON public.banks
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
        )
    );

-- Insert default values
INSERT INTO public.banks (bank_code, bank_name_thai, bank_name, swift_code, image_url)
VALUES 
    ('SCB', 'ธนาคารไทยพาณิชย์', 'Siam Commercial Bank', 'SICOTHBK', '/assets/banks/bankicon_SICOTHBK.svg'),
    ('KBANK', 'ธนาคารกสิกรไทย', 'Kasikorn Bank', 'KASITHBK', '/assets/banks/bankicon_KASITHBK.svg'),
    ('KTB', 'ธนาคารกรุงไทย', 'Krung Thai Bank', 'KRTHTHBK', '/assets/banks/bankicon_KRTHTHBK.svg'),
    ('BBL', 'ธนาคารกรุงเทพ', 'Bangkok Bank', 'BKKBTHBK', '/assets/banks/bankicon_BKKBTHBK.svg'),
    ('TTB', 'ธนาคารทหารไทยธนชาต', 'Tmbthanachart Bank', 'TMBKTHBK', '/assets/banks/bankicon_TMBKTHBK.svg'),
    ('GSB', 'ธนาคารออมสิน', 'Government Savings Bank', 'GSBATHBK', '/assets/banks/bankicon_GSBATHBK.svg'),
    ('BAY', 'ธนาคารกรุงศรีอยุธยา', 'Bank of Ayudhya', 'AYUDTHBK', '/assets/banks/bankicon_AYUDTHBK.svg'),
    ('BAAC', 'ธนาคารเพื่อการเกษตรและสหกรณ์', 'Bank for Agriculture and Agricultural Cooperatives', 'BAABTHBK', '/assets/banks/bankicon_BAABTHBK.svg'),
    ('UOBT', 'ธนาคารยูโอบี', 'United Overseas Bank (Thai)', 'UOVBTHBK', '/assets/banks/bankicon_UOVBTHBK.svg'),
    ('GHB', 'ธนาคารอาคารสงเคราะห์', 'Government Housing Bank', 'GOHUTHB1', '/assets/banks/bankicon_GOHUTHB1.svg'),
    ('CIMBT', 'ธนาคารซีไอเอ็มบีไทย', 'Cimb Thai Bank', 'UBOBTHBK', '/assets/banks/bankicon_UBOBTHBK.svg'),
    ('CITI', 'ธนาคารซิติแบงก์', 'Citi Bank', 'CITITHBX', '/assets/banks/bankicon_CITITHBX.svg'),
    ('DB', 'ธนาคารดอยซ์แบงก์', 'Deutsche Bank', 'DEUTTHBK', '/assets/banks/bankicon_DEUTTHBK.svg'),
    ('HSBC', 'ธนาคารฮ่องกงและเซี่ยงไฮ้', 'Hongkong and Shanghai Bank', 'HSBCTHBK', '/assets/banks/bankicon_HSBCTHBK.svg'),
    ('ICBCT', 'ธนาคารไอซีบีซี (ไทย)', 'Industrial and Commercial Bank of China (Thai)', 'ICBKTHBK', '/assets/banks/bankicon_ICBKTHBK.svg'),
    ('ISBT', 'ธนาคารอิสลามแห่งประเทศไทย', 'Islamic Bank of Thailand', 'TIBTTHBK', '/assets/banks/bankicon_TIBTTHBK.svg'),
    ('KKP', 'ธนาคารเกียรตินาคินภัทร', 'Kiatnakin Phatra Bank', 'KKPBTHBK', '/assets/banks/bankicon_KKPBTHBK.svg'),
    ('LHFG', 'ธนาคารแลนด์ แอนด์ เฮ้าส์', 'Land and Houses Bank', 'LAHRTHB2', '/assets/banks/bankicon_LAHRTHB2.svg'),
    ('MHCB', 'ธนาคารมิซูโฮ', 'Mizuho Bank', 'MHCBTHBK', '/assets/banks/bankicon_MHCBTHBK.svg'),
    ('SCBT', 'ธนาคารสแตนดาร์ดชาร์เตอร์ด (ไทย)', 'Standard Chartered Bank (Thai)', 'SCBLTHBX', '/assets/banks/bankicon_SCBLTHBX.svg'),
    ('SMBC', 'ธนาคารซูมิโตโม มิตซุย', 'Sumitomo Mitsui Bank', 'SMBCTHBK', '/assets/banks/bankicon_SMBCTHBK.svg'),
    ('Thai Credit Bank', 'ธนาคารไทยเครดิตเพื่อรายย่อย', 'Thai Credit Bank', 'THCETHB02', '/assets/banks/bankicon_THCETHB1.svg'),
    ('TISCO', 'ธนาคารทิสโก้', 'Tisco Bank', 'TFPCTHB1', '/assets/banks/bankicon_TFPCTHB1.svg'),
    ('PROMPTPAY', 'พร้อมเพย์ (PromptPay)', 'Promptpay', 'PROMPTPAY', '/assets/banks/bankicon_PROMPTPAY.svg')
ON CONFLICT (bank_code) DO NOTHING;