CREATE TABLE public.oracle_memory (
  user_id UUID NOT NULL PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  notes TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.oracle_memory TO authenticated;
GRANT ALL ON public.oracle_memory TO service_role;
ALTER TABLE public.oracle_memory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own oracle memory" ON public.oracle_memory FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);