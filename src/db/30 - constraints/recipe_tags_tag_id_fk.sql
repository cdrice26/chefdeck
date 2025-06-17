--
-- Name: recipe_tags recipe_tags_tag_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recipe_tags
    ADD CONSTRAINT recipe_tags_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.user_tags(id);
