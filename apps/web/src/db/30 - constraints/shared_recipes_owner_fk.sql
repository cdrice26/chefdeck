--
-- Name: shared_recipes shared_recipes_owner_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shared_recipes
    ADD CONSTRAINT shared_recipes_owner_fkey FOREIGN KEY (owner) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE;
