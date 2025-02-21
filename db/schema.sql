--
-- PostgreSQL database dump
--

-- Dumped from database version 15.8
-- Dumped by pg_dump version 17.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA public;


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS 'standard public schema';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: game_states; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.game_states (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    stats jsonb NOT NULL,
    inventory jsonb NOT NULL,
    event_log jsonb NOT NULL,
    saved_at text NOT NULL,
    character_name text,
    character_description text,
    main_quest jsonb,
    side_quests jsonb DEFAULT '[]'::jsonb
);


--
-- Name: games; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.games (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    game_state_id uuid NOT NULL,
    conversation jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    name text DEFAULT ''::text,
    description text
);


--
-- Name: session; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.session (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL
);


--
-- Name: user_preferences; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_preferences (
    user_id uuid NOT NULL,
    theme_variant text DEFAULT 'classic'::text NOT NULL,
    theme_colors jsonb DEFAULT '{"primary": null, "secondary": null}'::jsonb,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    custom_colors jsonb
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    username text NOT NULL,
    password text NOT NULL,
    current_game_state jsonb,
    language text DEFAULT 'en'::text
);


--
-- Name: game_states game_states_new_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.game_states
    ADD CONSTRAINT game_states_new_pkey PRIMARY KEY (id);


--
-- Name: games games_new_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.games
    ADD CONSTRAINT games_new_pkey PRIMARY KEY (id);


--
-- Name: session session_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (sid);


--
-- Name: user_preferences user_preferences_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_preferences
    ADD CONSTRAINT user_preferences_pkey PRIMARY KEY (user_id);


--
-- Name: users users_new_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_new_pkey PRIMARY KEY (id);


--
-- Name: users users_new_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_new_username_key UNIQUE (username);


--
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_session_expire" ON public.session USING btree (expire);


--
-- Name: idx_game_states_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_game_states_user_id ON public.game_states USING btree (user_id);


--
-- Name: idx_games_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_games_user_id ON public.games USING btree (user_id);


--
-- Name: idx_user_preferences_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_preferences_user_id ON public.user_preferences USING btree (user_id);


--
-- Name: game_states game_states_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.game_states
    ADD CONSTRAINT game_states_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: games games_game_state_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.games
    ADD CONSTRAINT games_game_state_id_fkey FOREIGN KEY (game_state_id) REFERENCES public.game_states(id) ON DELETE CASCADE;


--
-- Name: games games_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.games
    ADD CONSTRAINT games_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_preferences user_preferences_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_preferences
    ADD CONSTRAINT user_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: games Users can delete own games; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete own games" ON public.games FOR DELETE USING ((user_id = auth.uid()));


--
-- Name: user_preferences Users can insert own preferences; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own preferences" ON public.user_preferences FOR INSERT WITH CHECK ((user_id = auth.uid()));


--
-- Name: game_states Users can modify own game states; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can modify own game states" ON public.game_states FOR UPDATE USING ((user_id = auth.uid()));


--
-- Name: games Users can modify own games; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can modify own games" ON public.games FOR UPDATE USING ((user_id = auth.uid()));


--
-- Name: user_preferences Users can modify own preferences; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can modify own preferences" ON public.user_preferences FOR UPDATE USING ((user_id = auth.uid()));


--
-- Name: game_states Users can view own game states; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own game states" ON public.game_states FOR SELECT USING ((user_id = auth.uid()));


--
-- Name: games Users can view own games; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own games" ON public.games FOR SELECT USING ((user_id = auth.uid()));


--
-- Name: user_preferences Users can view own preferences; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own preferences" ON public.user_preferences FOR SELECT USING ((user_id = auth.uid()));


--
-- Name: users Users can view own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING ((id = auth.uid()));


--
-- Name: game_states; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.game_states ENABLE ROW LEVEL SECURITY;

--
-- Name: games; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

--
-- Name: user_preferences; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

--
-- Name: users; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--

