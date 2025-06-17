--
-- Name: recipe_tags; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.recipe_tags (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    recipe_id uuid DEFAULT gen_random_uuid() NOT NULL,
    tag_id uuid DEFAULT gen_random_uuid() NOT NULL
);

ALTER TABLE public.recipe_tags OWNER TO postgres;