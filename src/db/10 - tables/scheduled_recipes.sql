--
-- Name: scheduled_recipes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.scheduled_recipes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    recipe_id uuid NOT NULL,
    user_id uuid NOT NULL,
    date date NOT NULL,
    repeat text
);


ALTER TABLE public.scheduled_recipes OWNER TO postgres;