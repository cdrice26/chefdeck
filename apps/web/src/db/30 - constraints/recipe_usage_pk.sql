--
-- Name: recipe_usage recipe_usage_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recipe_usage
    ADD CONSTRAINT recipe_usage_pkey PRIMARY KEY (user_id, recipe_id);