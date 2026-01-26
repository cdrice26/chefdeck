--
-- Name: directions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.directions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    content text NOT NULL,
    sequence integer NOT NULL,
    recipe_id uuid NOT NULL
);


ALTER TABLE public.directions OWNER TO postgres;