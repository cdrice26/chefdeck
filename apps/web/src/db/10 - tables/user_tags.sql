--
-- Name: user_tags; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_tags (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    user_id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE public.user_tags OWNER TO postgres;