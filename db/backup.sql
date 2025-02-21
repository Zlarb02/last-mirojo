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
-- Data for Name: game_states; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.game_states (id, user_id, stats, inventory, event_log, saved_at, character_name, character_description, main_quest, side_quests) FROM stdin;
3a163466-2c2a-4609-87fb-eb4f1197629a	f7ea2127-8cc7-4d80-a22f-db8318493b7e	{"0": {"name": "Santé", "value": 100, "config": {"max": 100, "type": "progress", "color": "#ef4444"}}, "1": {"name": "Mana", "value": 100, "config": {"max": 100, "type": "progress", "color": "#3b82f6"}}, "2": {"name": "Niveau", "value": 1, "config": {"type": "number"}}, "mana": 0, "level": 0, "health": 0}	[]	[]	2025-02-21T13:06:17.412Z	pogo		{"title": "", "status": "Not started", "description": ""}	[]
062bd9e7-0341-41d6-9701-984b0fb8933f	f7ea2127-8cc7-4d80-a22f-db8318493b7e	[{"name": "Santé", "value": 100, "config": {"max": 100, "type": "progress", "color": "#ef4444"}}, {"name": "Mana", "value": 100, "config": {"max": 100, "type": "progress", "color": "#3b82f6"}}, {"name": "Niveau", "value": 1, "config": {"type": "number"}}]	[]	[]	2025-02-21T13:06:27.628Z			{"title": "", "status": "Not started", "description": ""}	[]
ae30437a-495e-4caf-91a6-84ab8ed41c43	f7ea2127-8cc7-4d80-a22f-db8318493b7e	{"0": {"name": "Santé", "value": 100, "config": {"max": 100, "type": "progress", "color": "#ef4444"}}, "1": {"name": "Mana", "value": 100, "config": {"max": 100, "type": "progress", "color": "#3b82f6"}}, "2": {"name": "Niveau", "value": 1, "config": {"type": "number"}}, "mana": 0, "level": 0, "health": 0}	[]	[]	2025-02-21T13:06:45.194Z			{"title": "", "status": "Not started", "description": ""}	[]
c0accfea-9de8-451f-a9a8-98cc609093c9	f7ea2127-8cc7-4d80-a22f-db8318493b7e	[{"name": "Santé", "value": 100, "config": {"max": 100, "type": "progress", "color": "#ef4444"}}, {"name": "Mana", "value": 100, "config": {"max": 100, "type": "progress", "color": "#3b82f6"}}, {"name": "Niveau", "value": 1, "config": {"type": "number"}}]	[]	[]	2025-02-21T13:07:31.781Z	pogo		{"title": "", "status": "Not started", "description": ""}	[]
\.


--
-- Data for Name: games; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.games (id, user_id, game_state_id, conversation, created_at, updated_at, name, description) FROM stdin;
dcf5bea4-8b5b-4db7-900a-9c71a976b912	f7ea2127-8cc7-4d80-a22f-db8318493b7e	3a163466-2c2a-4609-87fb-eb4f1197629a	{"messages": [], "timestamp": "2025-02-21T13:05:38.913Z"}	2025-02-21 13:05:31.254224+00	2025-02-21 13:05:31.254224+00		\N
b9b2e5e8-9502-4192-84fb-c512f99fc303	f7ea2127-8cc7-4d80-a22f-db8318493b7e	c0accfea-9de8-451f-a9a8-98cc609093c9	{"messages": [{"role": "user", "content": "hello", "timestamp": "2025-02-21T13:06:16.682Z"}, {"role": "assistant", "content": "<response>\\n  <stats>\\n    <health>0</health>\\n    <mana>0</mana>\\n    <level>0</level>\\n  </stats>\\n  <inventory>\\n    <item1></item1>\\n    <item2></item2>\\n  </inventory>\\n  <eventLog>\\n    <event1></event1>\\n    <event2></event2>\\n  </eventLog>\\n  <message>Bonjour ! Il semble que tu n'as pas encore commencé ton aventure. Veux-tu initialiser ta partie et sauvegarder pour commencer ?</message>\\n</response>", "timestamp": "2025-02-21T13:06:17.318Z"}], "timestamp": "2025-02-21T13:06:17.444Z"}	2025-02-21 13:06:09.902279+00	2025-02-21 13:06:09.902279+00		\N
3dcc61dc-23b7-4160-8bad-d361b38afd30	f7ea2127-8cc7-4d80-a22f-db8318493b7e	062bd9e7-0341-41d6-9701-984b0fb8933f	{"messages": [{"role": "user", "content": "hello", "timestamp": "2025-02-21T13:06:16.682Z"}, {"role": "assistant", "content": "<response>\\n  <stats>\\n    <health>0</health>\\n    <mana>0</mana>\\n    <level>0</level>\\n  </stats>\\n  <inventory>\\n    <item1></item1>\\n    <item2></item2>\\n  </inventory>\\n  <eventLog>\\n    <event1></event1>\\n    <event2></event2>\\n  </eventLog>\\n  <message>Bonjour ! Il semble que tu n'as pas encore commencé ton aventure. Veux-tu initialiser ta partie et sauvegarder pour commencer ?</message>\\n</response>", "timestamp": "2025-02-21T13:06:17.318Z"}, {"role": "user", "content": "je n'ai pas de nom ?", "timestamp": "2025-02-21T13:06:26.761Z"}, {"role": "assistant", "content": "<response>\\n  <stats>\\n    <health>0</health>\\n    <mana>0</mana>\\n    <level>0</level>\\n  </stats>\\n  <inventory>\\n    <item1></item1>\\n    <item2></item2>\\n  </inventory>\\n  <eventLog>\\n    <event1></event1>\\n    <event2></event2>\\n  </eventLog>\\n  <message>C'est exact, il semble que tu n'aies pas encore de nom. Souhaiterais-tu en choisir un avant de commencer ton aventure ?</message>\\n</response>", "timestamp": "2025-02-21T13:06:27.451Z"}], "timestamp": "2025-02-21T13:06:27.565Z"}	2025-02-21 13:06:19.916018+00	2025-02-21 13:06:19.916018+00		\N
b7528a0f-3b2c-40d7-bc30-f7265e7f14b4	f7ea2127-8cc7-4d80-a22f-db8318493b7e	ae30437a-495e-4caf-91a6-84ab8ed41c43	{"messages": [{"role": "user", "content": "hello", "timestamp": "2025-02-21T13:06:16.682Z"}, {"role": "assistant", "content": "<response>\\n  <stats>\\n    <health>0</health>\\n    <mana>0</mana>\\n    <level>0</level>\\n  </stats>\\n  <inventory>\\n    <item1></item1>\\n    <item2></item2>\\n  </inventory>\\n  <eventLog>\\n    <event1></event1>\\n    <event2></event2>\\n  </eventLog>\\n  <message>Bonjour ! Il semble que tu n'as pas encore commencé ton aventure. Veux-tu initialiser ta partie et sauvegarder pour commencer ?</message>\\n</response>", "timestamp": "2025-02-21T13:06:17.318Z"}, {"role": "user", "content": "je n'ai pas de nom ?", "timestamp": "2025-02-21T13:06:26.761Z"}, {"role": "assistant", "content": "<response>\\n  <stats>\\n    <health>0</health>\\n    <mana>0</mana>\\n    <level>0</level>\\n  </stats>\\n  <inventory>\\n    <item1></item1>\\n    <item2></item2>\\n  </inventory>\\n  <eventLog>\\n    <event1></event1>\\n    <event2></event2>\\n  </eventLog>\\n  <message>C'est exact, il semble que tu n'aies pas encore de nom. Souhaiterais-tu en choisir un avant de commencer ton aventure ?</message>\\n</response>", "timestamp": "2025-02-21T13:06:27.451Z"}, {"role": "user", "content": "normalement c'est bon mtn", "timestamp": "2025-02-21T13:06:43.985Z"}, {"role": "assistant", "content": "<response>\\n  <stats>\\n    <health>0</health>\\n    <mana>0</mana>\\n    <level>0</level>\\n  </stats>\\n  <inventory>\\n    <item1></item1>\\n    <item2></item2>\\n  </inventory>\\n  <eventLog>\\n    <event1></event1>\\n    <event2></event2>\\n  </eventLog>\\n  <message>Bienvenue dans ton aventure, <nom> ! Il semble que tu n'aies pas encore de quête principale. Souhaiterais-tu en démarrer une ?</message>\\n</response>", "timestamp": "2025-02-21T13:06:44.953Z"}], "timestamp": "2025-02-21T13:06:45.072Z"}	2025-02-21 13:06:37.484656+00	2025-02-21 13:06:37.484656+00		\N
\.


--
-- Data for Name: session; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.session (sid, sess, expire) FROM stdin;
ihE31Ma62C_MIhOs9EFOroyh5eleykql	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"},"passport":{"user":"f7ea2127-8cc7-4d80-a22f-db8318493b7e"}}	2025-02-22 13:08:14
\.


--
-- Data for Name: user_preferences; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_preferences (user_id, theme_variant, theme_colors, created_at, updated_at, custom_colors) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, username, password, current_game_state, language) FROM stdin;
f7ea2127-8cc7-4d80-a22f-db8318493b7e	etienne	52206d313bb17918060d6c9522c155b357e204efae84b29b0d0edb6a536aab7cf1a26dd5c3034743d71bdcb4328d6d64cc6f9c019c51af37934306db32e3d045.6e57b4acc7af2da9d9b367c82b33e2d0	\N	en
\.


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

