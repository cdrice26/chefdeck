--
-- Name: scheduled_recipes scheduled_recipes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scheduled_recipes
    ADD CONSTRAINT scheduled_recipes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE;
