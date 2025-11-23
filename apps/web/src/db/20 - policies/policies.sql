--
-- Name: recipe_tags Users can access their own recipe tags; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can access their own recipe tags" ON public.recipe_tags USING ((( SELECT auth.uid() AS uid) = ( SELECT r.user_id
   FROM public.recipes r
  WHERE (r.id = recipe_tags.recipe_id)))) WITH CHECK ((( SELECT auth.uid() AS uid) = ( SELECT r.user_id
   FROM public.recipes r
  WHERE (r.id = recipe_tags.recipe_id))));


--
-- Name: directions Users can add directions to their own recipes; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can add directions to their own recipes" ON public.directions FOR INSERT WITH CHECK ((( SELECT auth.uid() AS uid) = ( SELECT recipes.user_id
   FROM public.recipes
  WHERE (recipes.id = directions.recipe_id))));


--
-- Name: ingredients Users can add ingredients to their own recipes; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can add ingredients to their own recipes" ON public.ingredients FOR INSERT WITH CHECK ((( SELECT auth.uid() AS uid) = ( SELECT recipes.user_id
   FROM public.recipes
  WHERE (recipes.id = ingredients.recipe_id))));


--
-- Name: recipe_usage Users can add their own usage; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can add their own usage" ON public.recipe_usage FOR INSERT WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));


--
-- Name: profiles Users can create their own profiles; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can create their own profiles" ON public.profiles FOR INSERT WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));


--
-- Name: recipes Users can create their own recipes; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can create their own recipes" ON public.recipes FOR INSERT WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));


--
-- Name: directions Users can delete directions from their own recipes; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can delete directions from their own recipes" ON public.directions FOR DELETE USING ((( SELECT auth.uid() AS uid) = ( SELECT recipes.user_id
   FROM public.recipes
  WHERE (recipes.id = directions.recipe_id))));


--
-- Name: ingredients Users can delete ingredients from their own recipes; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can delete ingredients from their own recipes" ON public.ingredients FOR DELETE USING ((( SELECT auth.uid() AS uid) = ( SELECT recipes.user_id
   FROM public.recipes
  WHERE (recipes.id = ingredients.recipe_id))));


--
-- Name: profiles Users can delete their own profiles; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can delete their own profiles" ON public.profiles FOR DELETE USING ((( SELECT auth.uid() AS uid) = user_id));


--
-- Name: recipes Users can delete their own recipes; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can delete their own recipes" ON public.recipes FOR DELETE USING ((( SELECT auth.uid() AS uid) = user_id));


--
-- Name: recipe_usage Users can delete their own usage; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can delete their own usage" ON public.recipe_usage FOR DELETE USING ((( SELECT auth.uid() AS uid) = user_id));


--
-- Name: shared_recipes Users can revoke access after sharing a recipe; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can revoke access after sharing a recipe" ON public.shared_recipes FOR DELETE USING ((( SELECT auth.uid() AS uid) = owner));


--
-- Name: shared_recipes Users can revoke their own access to a recipe shared with them; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can revoke their own access to a recipe shared with them" ON public.shared_recipes FOR DELETE USING ((( SELECT auth.uid() AS uid) = recipient));


--
-- Name: scheduled_recipes Users can schedule their own recipes; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can schedule their own recipes" ON public.scheduled_recipes FOR INSERT WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));


--
-- Name: directions Users can see directions for recipes shared with them; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can see directions for recipes shared with them" ON public.directions FOR SELECT USING ((( SELECT auth.uid() AS uid) = ( SELECT sr.recipient
   FROM (public.shared_recipes sr
     JOIN public.recipes r ON (((sr.recipe_id = r.id) AND (r.id = sr.recipe_id)))))));


--
-- Name: ingredients Users can see ingredients for recipes shared with them; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can see ingredients for recipes shared with them" ON public.ingredients FOR SELECT USING ((( SELECT auth.uid() AS uid) = ( SELECT sr.recipient
   FROM (public.shared_recipes sr
     JOIN public.recipes r ON (((sr.recipe_id = r.id) AND (r.id = sr.recipe_id)))))));


--
-- Name: recipes Users can see shared recipes; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can see shared recipes" ON public.recipes FOR SELECT USING ((( SELECT shared_recipes.recipient
   FROM public.shared_recipes
  WHERE (shared_recipes.recipe_id = shared_recipes.id)) = ( SELECT auth.uid() AS uid)));


--
-- Name: shared_recipes Users can see shared recipes they're involved with; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can see shared recipes they're involved with" ON public.shared_recipes FOR SELECT USING (((( SELECT auth.uid() AS uid) = recipient) OR (( SELECT auth.uid() AS uid) = owner)));


--
-- Name: scheduled_recipes Users can see their own scheduled recipes; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can see their own scheduled recipes" ON public.scheduled_recipes FOR SELECT USING ((( SELECT auth.uid() AS uid) = user_id));


--
-- Name: profiles Users can see users that shared recipes; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can see users that shared recipes" ON public.profiles FOR SELECT USING ((( SELECT count(*) AS count
   FROM public.shared_recipes
  WHERE ((shared_recipes.recipient = ( SELECT auth.uid() AS uid)) AND (shared_recipes.owner = profiles.user_id))) > 0));


--
-- Name: directions Users can select directions from their own recipes; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can select directions from their own recipes" ON public.directions FOR SELECT USING ((( SELECT auth.uid() AS uid) = ( SELECT recipes.user_id
   FROM public.recipes
  WHERE (recipes.id = directions.recipe_id))));


--
-- Name: ingredients Users can select ingredients from their own recipes; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can select ingredients from their own recipes" ON public.ingredients FOR SELECT USING ((( SELECT auth.uid() AS uid) = ( SELECT recipes.user_id
   FROM public.recipes
  WHERE (recipes.id = ingredients.recipe_id))));


--
-- Name: recipes Users can select their own recipes; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can select their own recipes" ON public.recipes FOR SELECT USING ((( SELECT auth.uid() AS uid) = user_id));


--
-- Name: recipe_usage Users can select their own usage; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can select their own usage" ON public.recipe_usage FOR SELECT USING ((( SELECT auth.uid() AS uid) = user_id));


--
-- Name: shared_recipes Users can share their own recipes; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can share their own recipes" ON public.shared_recipes FOR INSERT WITH CHECK ((( SELECT auth.uid() AS uid) = owner));


--
-- Name: scheduled_recipes Users can unschedule their own recipes; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can unschedule their own recipes" ON public.scheduled_recipes FOR DELETE USING ((( SELECT auth.uid() AS uid) = user_id));


--
-- Name: directions Users can update directions for their own recipes; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can update directions for their own recipes" ON public.directions FOR UPDATE USING ((( SELECT auth.uid() AS uid) = ( SELECT recipes.user_id
   FROM public.recipes
  WHERE (recipes.id = directions.recipe_id)))) WITH CHECK ((( SELECT auth.uid() AS uid) = ( SELECT recipes.user_id
   FROM public.recipes
  WHERE (recipes.id = directions.recipe_id))));


--
-- Name: ingredients Users can update ingredients on their own recipes; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can update ingredients on their own recipes" ON public.ingredients FOR UPDATE USING ((( SELECT auth.uid() AS uid) = ( SELECT recipes.user_id
   FROM public.recipes
  WHERE (recipes.id = ingredients.recipe_id)))) WITH CHECK ((( SELECT auth.uid() AS uid) = ( SELECT recipes.user_id
   FROM public.recipes
  WHERE (recipes.id = ingredients.recipe_id))));


--
-- Name: profiles Users can update their own profiles; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can update their own profiles" ON public.profiles FOR UPDATE USING ((( SELECT auth.uid() AS uid) = user_id)) WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));


--
-- Name: recipes Users can update their own recipes; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can update their own recipes" ON public.recipes FOR UPDATE USING ((( SELECT auth.uid() AS uid) = user_id)) WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));


--
-- Name: scheduled_recipes Users can update their own scheduled recipes; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can update their own scheduled recipes" ON public.scheduled_recipes FOR UPDATE USING ((( SELECT auth.uid() AS uid) = user_id)) WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));


--
-- Name: recipe_usage Users can update their own usage; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can update their own usage" ON public.recipe_usage FOR UPDATE USING ((( SELECT auth.uid() AS uid) = user_id)) WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));


--
-- Name: user_tags Users can use their own tags; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can use their own tags" ON public.user_tags TO dashboard_user, authenticated, anon, service_role, supabase_admin, authenticator, pgbouncer, supabase_auth_admin, supabase_storage_admin, supabase_replication_admin, supabase_read_only_user, supabase_realtime_admin, postgres USING ((( SELECT auth.uid() AS uid) = user_id)) WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));


--
-- Name: profiles Users can view their own profiles; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view their own profiles" ON public.profiles FOR SELECT USING ((( SELECT auth.uid() AS uid) = user_id));


--
-- Name: directions; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.directions ENABLE ROW LEVEL SECURITY;

--
-- Name: ingredients; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.ingredients ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: recipe_tags; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.recipe_tags ENABLE ROW LEVEL SECURITY;

--
-- Name: recipe_usage; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.recipe_usage ENABLE ROW LEVEL SECURITY;

--
-- Name: recipes; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;

--
-- Name: scheduled_recipes; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.scheduled_recipes ENABLE ROW LEVEL SECURITY;

--
-- Name: shared_recipes; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.shared_recipes ENABLE ROW LEVEL SECURITY;

--
-- Name: user_tags; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.user_tags ENABLE ROW LEVEL SECURITY;

--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT USAGE ON SCHEMA public TO postgres;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;


--
-- Name: FUNCTION create_recipe(p_title text, p_yield_value smallint, p_minutes integer, p_img_url text, p_current_user_id uuid, p_color text, p_ingredients jsonb, p_directions jsonb, p_tags jsonb); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.create_recipe(p_title text, p_yield_value smallint, p_minutes integer, p_img_url text, p_current_user_id uuid, p_color text, p_ingredients jsonb, p_directions jsonb, p_tags jsonb) TO anon;
GRANT ALL ON FUNCTION public.create_recipe(p_title text, p_yield_value smallint, p_minutes integer, p_img_url text, p_current_user_id uuid, p_color text, p_ingredients jsonb, p_directions jsonb, p_tags jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.create_recipe(p_title text, p_yield_value smallint, p_minutes integer, p_img_url text, p_current_user_id uuid, p_color text, p_ingredients jsonb, p_directions jsonb, p_tags jsonb) TO service_role;


--
-- Name: FUNCTION get_profile(current_user_id uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_profile(current_user_id uuid) TO anon;
GRANT ALL ON FUNCTION public.get_profile(current_user_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.get_profile(current_user_id uuid) TO service_role;


--
-- Name: FUNCTION get_recipe_by_id(p_id uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_recipe_by_id(p_id uuid) TO anon;
GRANT ALL ON FUNCTION public.get_recipe_by_id(p_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.get_recipe_by_id(p_id uuid) TO service_role;


--
-- Name: FUNCTION get_recipe_image(p_recipe_id uuid, p_user_id uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_recipe_image(p_recipe_id uuid, p_user_id uuid) TO anon;
GRANT ALL ON FUNCTION public.get_recipe_image(p_recipe_id uuid, p_user_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.get_recipe_image(p_recipe_id uuid, p_user_id uuid) TO service_role;


--
-- Name: FUNCTION get_recipes(in_user_id uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_recipes(in_user_id uuid) TO anon;
GRANT ALL ON FUNCTION public.get_recipes(in_user_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.get_recipes(in_user_id uuid) TO service_role;


--
-- Name: FUNCTION get_tags(current_user_id uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_tags(current_user_id uuid) TO anon;
GRANT ALL ON FUNCTION public.get_tags(current_user_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.get_tags(current_user_id uuid) TO service_role;


--
-- Name: FUNCTION update_recipe(p_id uuid, p_title text, p_yield_value smallint, p_minutes integer, p_img_url text, p_current_user_id uuid, p_color text, p_ingredients jsonb, p_directions jsonb, p_tags jsonb); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.update_recipe(p_id uuid, p_title text, p_yield_value smallint, p_minutes integer, p_img_url text, p_current_user_id uuid, p_color text, p_ingredients jsonb, p_directions jsonb, p_tags jsonb) TO anon;
GRANT ALL ON FUNCTION public.update_recipe(p_id uuid, p_title text, p_yield_value smallint, p_minutes integer, p_img_url text, p_current_user_id uuid, p_color text, p_ingredients jsonb, p_directions jsonb, p_tags jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.update_recipe(p_id uuid, p_title text, p_yield_value smallint, p_minutes integer, p_img_url text, p_current_user_id uuid, p_color text, p_ingredients jsonb, p_directions jsonb, p_tags jsonb) TO service_role;


--
-- Name: TABLE directions; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.directions TO anon;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.directions TO authenticated;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.directions TO service_role;


--
-- Name: TABLE ingredients; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.ingredients TO anon;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.ingredients TO authenticated;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.ingredients TO service_role;


--
-- Name: TABLE profiles; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.profiles TO anon;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.profiles TO authenticated;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.profiles TO service_role;


--
-- Name: TABLE recipe_tags; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.recipe_tags TO anon;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.recipe_tags TO authenticated;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.recipe_tags TO service_role;


--
-- Name: TABLE recipe_usage; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.recipe_usage TO anon;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.recipe_usage TO authenticated;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.recipe_usage TO service_role;


--
-- Name: TABLE recipes; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.recipes TO anon;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.recipes TO authenticated;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.recipes TO service_role;


--
-- Name: TABLE scheduled_recipes; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.scheduled_recipes TO anon;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.scheduled_recipes TO authenticated;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.scheduled_recipes TO service_role;


--
-- Name: TABLE shared_recipes; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.shared_recipes TO anon;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.shared_recipes TO authenticated;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.shared_recipes TO service_role;


--
-- Name: TABLE user_tags; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.user_tags TO anon;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.user_tags TO authenticated;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.user_tags TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLES TO service_role;

