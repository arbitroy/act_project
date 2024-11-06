-- Add status column with default value
ALTER TABLE public.elements 
ADD COLUMN status varchar(20) NOT NULL DEFAULT 'active';

-- Update existing records
UPDATE public.elements SET status = 'active';

-- Create an index on status for better query performance
CREATE INDEX idx_elements_status ON public.elements(status);

-- Add timestamp columns for tracking
ALTER TABLE public.elements
ADD COLUMN deleted_at timestamp without time zone,
ADD COLUMN deleted_by integer REFERENCES public.users(id);