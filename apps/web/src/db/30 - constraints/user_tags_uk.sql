--
-- Name: user_tags unique_user_tag; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_tags
    ADD CONSTRAINT unique_user_tag UNIQUE (user_id, name);