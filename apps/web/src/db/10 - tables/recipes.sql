--
-- Name: recipes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.recipes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    yield smallint NOT NULL,
    minutes integer NOT NULL,
    color text NOT NULL,
    img_url text,
    source text,
    user_id uuid NOT NULL,
    last_updated timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.recipes OWNER TO postgres;
