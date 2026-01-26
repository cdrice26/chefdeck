--
-- Name: recipe_usage; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.recipe_usage (
    last_viewed timestamp with time zone DEFAULT now() NOT NULL,
    user_id uuid NOT NULL,
    recipe_id uuid NOT NULL
);


ALTER TABLE public.recipe_usage OWNER TO postgres;