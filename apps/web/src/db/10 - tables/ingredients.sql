--
-- Name: ingredients; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ingredients (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    recipe_id uuid DEFAULT gen_random_uuid() NOT NULL,
    amount integer NOT NULL,
    unit text NOT NULL,
    name text NOT NULL,
    sequence integer NOT NULL,
    CONSTRAINT "Ingredients_sequence_check" CHECK ((sequence > 0))
);

ALTER TABLE public.ingredients OWNER TO postgres;