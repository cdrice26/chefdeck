--
-- Name: shared_recipes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shared_recipes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    owner uuid NOT NULL,
    recipient uuid NOT NULL,
    recipe_id uuid NOT NULL
);


ALTER TABLE public.shared_recipes OWNER TO postgres;