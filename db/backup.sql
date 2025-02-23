--
-- PostgreSQL database dump
--

-- Dumped from database version 15.8
-- Dumped by pg_dump version 15.12 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: pg_database_owner
--

CREATE SCHEMA public;


ALTER SCHEMA public OWNER TO pg_database_owner;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: pg_database_owner
--

COMMENT ON SCHEMA public IS 'standard public schema';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: game_states; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.game_states OWNER TO postgres;

--
-- Name: games; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.games OWNER TO postgres;

--
-- Name: session; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.session (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL
);


ALTER TABLE public.session OWNER TO postgres;

--
-- Name: user_preferences; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_preferences (
    user_id uuid NOT NULL,
    theme_variant text DEFAULT 'classic'::text NOT NULL,
    theme_colors jsonb DEFAULT '{"primary": null, "secondary": null}'::jsonb,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    custom_colors jsonb
);


ALTER TABLE public.user_preferences OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    username text NOT NULL,
    password text NOT NULL,
    current_game_state jsonb,
    language text DEFAULT 'en'::text
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Data for Name: game_states; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.game_states (id, user_id, stats, inventory, event_log, saved_at, character_name, character_description, main_quest, side_quests) FROM stdin;
889bc9e9-7db3-404f-9c10-bde08d9def74	f7ea2127-8cc7-4d80-a22f-db8318493b7e	[{"name": "Santé", "value": 0, "config": {"max": 100, "type": "progress", "color": "#ef4444"}}, {"name": "Mana", "value": 0, "config": {"max": 100, "type": "progress", "color": "#3b82f6"}}, {"name": "Niveau", "value": 0, "config": {"type": "number"}}]	[]	[]	2025-02-22T15:03:03.533Z			{"title": "", "status": "Not started", "description": ""}	[]
78e51ffc-a431-478e-9bfd-f0eb158c28d4	f7ea2127-8cc7-4d80-a22f-db8318493b7e	[{"name": "Santé", "value": 0, "config": {"max": 100, "type": "progress", "color": "#ef4444"}}, {"name": "Mana", "value": 0, "config": {"max": 100, "type": "progress", "color": "#3b82f6"}}, {"name": "Niveau", "value": 0, "config": {"type": "number"}}]	[]	[]	2025-02-21T23:43:47.466Z			{"title": "", "status": "Not started", "description": ""}	[]
dd17577e-3276-4ae9-b781-64fe7976aced	f7ea2127-8cc7-4d80-a22f-db8318493b7e	[{"name": "Santé", "value": "80", "config": {"max": 100, "type": "progress", "color": "#ef4444"}}, {"name": "Mana", "value": 30, "config": {"max": 100, "type": "progress", "color": "#3b82f6"}}, {"name": "Niveau", "value": 1, "config": {"type": "number"}}]	[]	[]	2025-02-22T14:03:20.411Z	Pierre		{"title": "", "status": "Not started", "description": ""}	[]
\.


--
-- Data for Name: games; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.games (id, user_id, game_state_id, conversation, created_at, updated_at, name, description) FROM stdin;
12dbc14d-350e-42ca-99cb-30f29b9a384e	f7ea2127-8cc7-4d80-a22f-db8318493b7e	78e51ffc-a431-478e-9bfd-f0eb158c28d4	{"messages": [{"role": "user", "content": "on joue", "timestamp": "2025-02-21T23:43:46.346Z"}, {"role": "assistant", "content": "<response>\\n  <stats>\\n    <health>0</health>\\n    <mana>0</mana>\\n    <level>0</level>\\n  </stats>\\n  <character>\\n    <name>Sans nom</name>\\n    <description>Aucune description</description>\\n  </character>\\n  <quests>\\n    <mainQuest>\\n      <title>Aucun titre</title>\\n      <description>Aucune description</description>\\n      <status>Not started</status>\\n    </mainQuest>\\n  </quests>\\n  <inventory>\\n    <item1></item1>\\n    <item2></item2>\\n  </inventory>\\n  <eventLog>\\n    <event1></event1>\\n    <event2></event2>\\n  </eventLog>\\n  <message>Bienvenue dans ce monde d'aventure ! Votre voyage ne pourra commencer qu'une fois que vous aurez choisi un nom et une description pour votre personnage. N'oubliez pas de sauvegarder votre partie une fois que vous aurez terminé.</message>\\n</response>", "timestamp": "2025-02-21T23:43:47.405Z"}], "timestamp": "2025-02-21T23:43:47.405Z"}	2025-02-21 23:43:47.697831+00	2025-02-21 23:43:47.697831+00	jeannneeuuh	
110f4516-94fa-463d-85c9-f1a085fa29c5	f7ea2127-8cc7-4d80-a22f-db8318493b7e	889bc9e9-7db3-404f-9c10-bde08d9def74	{"messages": [{"role": "user", "content": "Bonjour", "timestamp": "2025-02-21T16:53:30.639Z"}, {"role": "assistant", "content": "<response>\\n  <stats>\\n    <health>0</health>\\n    <mana>0</mana>\\n    <level>0</level>\\n  </stats>\\n  <character>\\n    <name>Sans nom</name>\\n    <description>Aucune description</description>\\n  </character>\\n  <quests>\\n    <mainQuest>\\n      <title>Aucune</title>\\n      <description>Aucune</description>\\n      <status>Not started</status>\\n    </mainQuest>\\n  </quests>\\n  <inventory>\\n    <item1></item1>\\n    <item2></item2>\\n  </inventory>\\n  <eventLog>\\n    <event1></event1>\\n    <event2></event2>\\n  </eventLog>\\n  <message>Bienvenue dans cette aventure interactive ! Il semble que vous n'ayez pas encore commencé votre quête principale. Pour démarrer, pensez à lui donner un titre et une description, puis enregistrez votre partie.</message>\\n</response>", "timestamp": "2025-02-21T16:53:31.673Z"}, {"role": "user", "content": "test", "timestamp": "2025-02-22T15:01:49.555Z"}, {"role": "assistant", "content": "<response>\\n  <stats>\\n    <health>0</health>\\n    <mana>0</mana>\\n    <level>0</level>\\n  </stats>\\n  <character>\\n    <name>Sans nom</name>\\n    <description>Aucune description</description>\\n  </character>\\n  <quests>\\n    <mainQuest>\\n      <title>Aucune</title>\\n      <description>Aucune</description>\\n      <status>Not started</status>\\n    </mainQuest>\\n  </quests>\\n  <inventory>\\n    <item1>test</item1>\\n    <item2></item2>\\n  </inventory>\\n  <eventLog>\\n    <event1></event1>\\n    <event2></event2>\\n  </eventLog>\\n  <message>Vous observez votre inventaire et vous y trouvez un objet nommé « test ». Il est temps de lui donner une utilité et de l'intégrer à votre quête principale. N'oubliez pas d'enregistrer votre partie pour conserver vos progrès.</message>\\n</response>", "timestamp": "2025-02-22T15:01:50.817Z"}, {"role": "user", "content": "re test", "timestamp": "2025-02-22T15:02:04.908Z"}, {"role": "assistant", "content": "Je suis désolé(e), je n'ai pas compris votre demande. Pouvez-vous préciser ce que vous voulez dire par « re test » ? Sinon, n'hésitez pas à me poser une question ou à me donner une instruction liée à notre aventure interactive. Je suis là pour vous aider et rendre votre histoire la plus immersive possible.\\n\\n<response>\\n  <stats>\\n    <health>0</health>\\n    <mana>0</mana>\\n    <level>0</level>\\n  </stats>\\n  <character>\\n    <name>Sans nom</name>\\n    <description>Aucune description</description>\\n  </character>\\n  <quests>\\n    <mainQuest>\\n      <title>Aucune</title>\\n      <description>Aucune</description>\\n      <status>Not started</status>\\n    </mainQuest>\\n  </quests>\\n  <inventory>\\n    <item1>test</item1>\\n    <item2></item2>\\n  </inventory>\\n  <eventLog>\\n    <event1></event1>\\n    <event2></event2>\\n  </eventLog>\\n  <message>Que souhaitez-vous faire ou quelle question aimeriez-vous poser ?</message>\\n</response>", "timestamp": "2025-02-22T15:02:05.979Z"}, {"role": "user", "content": "j'ai pas mis une autre string dans l'inventaire ?", "timestamp": "2025-02-22T15:02:20.989Z"}, {"role": "assistant", "content": "Non, vous n'avez pas ajouté d'autre objet dans l'inventaire. Vous n'avez qu'un seul objet, nommé « test ». Si vous le souhaitez, vous pouvez me demander d'ajouter d'autres objets à votre inventaire ou de poursuivre l'histoire avec l'objet actuel.\\n\\n<response>\\n  <stats>\\n    <health>0</health>\\n    <mana>0</mana>\\n    <level>0</level>\\n  </stats>\\n  <character>\\n    <name>Sans nom</name>\\n    <description>Aucune description</description>\\n  </character>\\n  <quests>\\n    <mainQuest>\\n      <title>Aucune</title>\\n      <description>Aucune</description>\\n      <status>Not started</status>\\n    </mainQuest>\\n  </quests>\\n  <inventory>\\n    <item1>test</item1>\\n    <item2></item2>\\n  </inventory>\\n  <eventLog>\\n    <event1></event1>\\n    <event2></event2>\\n  </eventLog>\\n  <message>Vous n'avez qu'un seul objet dans votre inventaire, à savoir « test ». Que souhaitez-vous en faire ou quelle action aimeriez-vous entreprendre ?</message>\\n</response>", "timestamp": "2025-02-22T15:02:22.555Z"}, {"role": "user", "content": "et mtn ?", "timestamp": "2025-02-22T15:02:34.036Z"}, {"role": "assistant", "content": "Je suis désolé(e), je ne comprends pas ce que vous voulez dire par « et mtn ? ». Pouvez-vous me poser une question ou me donner une instruction plus précise pour continuer notre histoire interactive ?\\n\\n<response>\\n  <stats>\\n    <health>0</health>\\n    <mana>0</mana>\\n    <level>0</level>\\n  </stats>\\n  <character>\\n    <name>Sans nom</name>\\n    <description>Aucune description</description>\\n  </character>\\n  <quests>\\n    <mainQuest>\\n      <title>Aucune</title>\\n      <description>Aucune</description>\\n      <status>Not started</status>\\n    </mainQuest>\\n  </quests>\\n  <inventory>\\n    <item1>test</item1>\\n    <item2></item2>\\n  </inventory>\\n  <eventLog>\\n    <event1></event1>\\n    <event2></event2>\\n  </eventLog>\\n  <message>Que souhaitez-vous faire ou quelle question aimeriez-vous poser ?</message>\\n</response>", "timestamp": "2025-02-22T15:02:35.046Z"}, {"role": "user", "content": "qu'ai je dans mon inventaire ?", "timestamp": "2025-02-22T15:03:01.955Z"}, {"role": "assistant", "content": "Vous avez deux objets dans votre inventaire. Le premier est « test » et le deuxième est « ça marche ? ». Vous avez également deux autres objets, un « arc » et une « épée en bois ». Que souhaitez-vous faire avec ces objets ou où aimeriez-vous aller ensuite ?\\n\\n<response>\\n  <stats>\\n    <health>0</health>\\n    <mana>0</mana>\\n    <level>0</level>\\n  </stats>\\n  <character>\\n    <name>Sans nom</name>\\n    <description>Aucune description</description>\\n  </character>\\n  <quests>\\n    <mainQuest>\\n      <title>Aucune</title>\\n      <description>Aucune</description>\\n      <status>Not started</status>\\n    </mainQuest>\\n  </quests>\\n  <inventory>\\n    <item1>test</item1>\\n    <item2>ça marche ?</item2>\\n  </inventory>\\n  <eventLog>\\n    <event1></event1>\\n    <event2></event2>\\n  </eventLog>\\n  <message>Vous avez les objets suivants dans votre inventaire : « test », « ça marche ? », un « arc » et une « épée en bois ». Que souhaitez-vous en faire ou où aimeriez-vous aller ensuite ?</message>\\n</response>", "timestamp": "2025-02-22T15:03:03.111Z"}], "timestamp": "2025-02-22T15:03:03.266Z"}	2025-02-21 16:53:31.81781+00	2025-02-23 09:54:00.215+00	pelouse partie	Partie de présentation
59a3e65a-94f1-4c2b-94af-3bf5b1678ad6	f7ea2127-8cc7-4d80-a22f-db8318493b7e	dd17577e-3276-4ae9-b781-64fe7976aced	{"messages": [{"role": "user", "content": "test", "timestamp": "2025-02-21T15:47:24.237Z"}, {"role": "assistant", "content": "<response>\\n  <stats>\\n    <health>0</health>\\n    <mana>0</mana>\\n    <level>0</level>\\n  </stats>\\n  <character>\\n    <name>Sans nom</name>\\n    <description>Aucune description</description>\\n  </character>\\n  <quests>\\n    <mainQuest>\\n      <title>Aucune</title>\\n      <description>Aucune description</description>\\n      <status>Not started</status>\\n    </mainQuest>\\n  </quests>\\n  <inventory>\\n    <item1></item1>\\n    <item2></item2>\\n  </inventory>\\n  <eventLog>\\n    <event1></event1>\\n    <event2></event2>\\n  </eventLog>\\n  <message>Bienvenue dans cette aventure interactive ! Pour commencer, veuillez choisir un nom et une description pour votre personnage, et enregistrer votre partie.</message>\\n</response>", "timestamp": "2025-02-21T15:47:25.399Z"}, {"role": "user", "content": "on peut commencer", "timestamp": "2025-02-21T15:47:57.916Z"}, {"role": "assistant", "content": "<response>\\n  <stats>\\n    <health>0</health>\\n    <mana>0</mana>\\n    <level>0</level>\\n  </stats>\\n  <character>\\n    <name>pierre</name>\\n    <description>l'homme de feu</description>\\n  </character>\\n  <quests>\\n    <mainQuest>\\n      <title>Aucune</title>\\n      <description>Aucune description</description>\\n      <status>Not started</status>\\n    </mainQuest>\\n  </quests>\\n  <inventory>\\n    <item1></item1>\\n    <item2></item2>\\n  </inventory>\\n  <eventLog>\\n    <event1></event1>\\n    <event2></event2>\\n  </eventLog>\\n  <message>Vous êtes <character><name>pierre</name></character>, l'homme de feu. Votre aventure vous attend. Que souhaitez-vous faire ?</message>\\n</response>", "timestamp": "2025-02-21T15:47:58.737Z"}, {"role": "user", "content": "invente une situation initiale", "timestamp": "2025-02-21T15:49:36.924Z"}, {"role": "assistant", "content": "<response>\\n  <stats>\\n    <health>50</health>\\n    <mana>30</mana>\\n    <level>1</level>\\n  </stats>\\n  <character>\\n    <name>pierre</name>\\n    <description>l'homme de feu</description>\\n  </character>\\n  <quests>\\n    <mainQuest>\\n      <title>rencontrer les anciens</title>\\n      <description>Qui sont ces mystérieux anciens ?</description>\\n      <status>Not started</status>\\n    </mainQuest>\\n  </quests>\\n  <inventory>\\n    <item1></item1>\\n    <item2></item2>\\n  </inventory>\\n  <eventLog>\\n    <event1></event1>\\n    <event2></event2>\\n  </eventLog>\\n  <message>Un jour, alors que vous étiez en train de méditer dans votre maison, une lumière éblouissante a soudain rempli la pièce. Lorsque la lumière s'est dissipée, vous avez vu une apparition d'un ancien qui vous a confié la quête de rencontrer les autres anciens. Où pouvez-vous commencer votre recherche ?</message>\\n</response>", "timestamp": "2025-02-21T15:49:37.954Z"}], "timestamp": "2025-02-22T14:03:20.257Z"}	2025-02-21 15:47:17.92391+00	2025-02-23 09:54:42.377+00	ça va en vrai	tout va bien
\.


--
-- Data for Name: session; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.session (sid, sess, expire) FROM stdin;
eb3bFdU92BRiCP_8pOc8gt0X75eWpHk1	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"},"passport":{"user":"f7ea2127-8cc7-4d80-a22f-db8318493b7e"}}	2025-02-24 10:10:01
w6euqJE-BzhoRWqzdK4W99H7LQis7a1B	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2025-02-23 14:23:20
VHOEfU8ysFGK6h0Ozez2y4MNhh25OXdi	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2025-02-23 14:23:20
-1GDr8IcC9N4oqXdXbliWmXUzaTsL6EZ	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2025-02-23 14:23:20
MWYdoDEmNj7Uj8EZuh2E9VYRbNGRD7bv	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2025-02-23 14:23:20
\.


--
-- Data for Name: user_preferences; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_preferences (user_id, theme_variant, theme_colors, created_at, updated_at, custom_colors) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, password, current_game_state, language) FROM stdin;
f7ea2127-8cc7-4d80-a22f-db8318493b7e	etienne	52206d313bb17918060d6c9522c155b357e204efae84b29b0d0edb6a536aab7cf1a26dd5c3034743d71bdcb4328d6d64cc6f9c019c51af37934306db32e3d045.6e57b4acc7af2da9d9b367c82b33e2d0	\N	en
8ac7666a-768f-496b-b219-434feb02c1d8	etienne5	0e55f97ca9c409b98c2ad145c01214182b413068bcbd46d4ca624a59d2282d2a71a71cfb6dc53e23ccda8ef72f45869b23e9364a2e00149a0be250ae347268db.df5958da63e6f67afa29feef684dec42	\N	en
\.


--
-- Name: game_states game_states_new_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.game_states
    ADD CONSTRAINT game_states_new_pkey PRIMARY KEY (id);


--
-- Name: games games_new_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.games
    ADD CONSTRAINT games_new_pkey PRIMARY KEY (id);


--
-- Name: session session_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (sid);


--
-- Name: user_preferences user_preferences_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_preferences
    ADD CONSTRAINT user_preferences_pkey PRIMARY KEY (user_id);


--
-- Name: users users_new_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_new_pkey PRIMARY KEY (id);


--
-- Name: users users_new_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_new_username_key UNIQUE (username);


--
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_session_expire" ON public.session USING btree (expire);


--
-- Name: idx_game_states_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_game_states_user_id ON public.game_states USING btree (user_id);


--
-- Name: idx_games_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_games_user_id ON public.games USING btree (user_id);


--
-- Name: idx_user_preferences_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_preferences_user_id ON public.user_preferences USING btree (user_id);


--
-- Name: game_states game_states_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.game_states
    ADD CONSTRAINT game_states_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: games games_game_state_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.games
    ADD CONSTRAINT games_game_state_id_fkey FOREIGN KEY (game_state_id) REFERENCES public.game_states(id) ON DELETE CASCADE;


--
-- Name: games games_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.games
    ADD CONSTRAINT games_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_preferences user_preferences_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_preferences
    ADD CONSTRAINT user_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: games Users can delete own games; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can delete own games" ON public.games FOR DELETE USING ((user_id = auth.uid()));


--
-- Name: user_preferences Users can insert own preferences; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can insert own preferences" ON public.user_preferences FOR INSERT WITH CHECK ((user_id = auth.uid()));


--
-- Name: game_states Users can modify own game states; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can modify own game states" ON public.game_states FOR UPDATE USING ((user_id = auth.uid()));


--
-- Name: games Users can modify own games; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can modify own games" ON public.games FOR UPDATE USING ((user_id = auth.uid()));


--
-- Name: user_preferences Users can modify own preferences; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can modify own preferences" ON public.user_preferences FOR UPDATE USING ((user_id = auth.uid()));


--
-- Name: game_states Users can view own game states; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view own game states" ON public.game_states FOR SELECT USING ((user_id = auth.uid()));


--
-- Name: games Users can view own games; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view own games" ON public.games FOR SELECT USING ((user_id = auth.uid()));


--
-- Name: user_preferences Users can view own preferences; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view own preferences" ON public.user_preferences FOR SELECT USING ((user_id = auth.uid()));


--
-- Name: users Users can view own profile; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING ((id = auth.uid()));


--
-- Name: game_states; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.game_states ENABLE ROW LEVEL SECURITY;

--
-- Name: games; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

--
-- Name: user_preferences; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

--
-- Name: users; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT USAGE ON SCHEMA public TO postgres;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;


--
-- Name: TABLE game_states; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.game_states TO anon;
GRANT ALL ON TABLE public.game_states TO authenticated;
GRANT ALL ON TABLE public.game_states TO service_role;


--
-- Name: TABLE games; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.games TO anon;
GRANT ALL ON TABLE public.games TO authenticated;
GRANT ALL ON TABLE public.games TO service_role;


--
-- Name: TABLE session; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.session TO anon;
GRANT ALL ON TABLE public.session TO authenticated;
GRANT ALL ON TABLE public.session TO service_role;


--
-- Name: TABLE user_preferences; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.user_preferences TO anon;
GRANT ALL ON TABLE public.user_preferences TO authenticated;
GRANT ALL ON TABLE public.user_preferences TO service_role;


--
-- Name: TABLE users; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.users TO anon;
GRANT ALL ON TABLE public.users TO authenticated;
GRANT ALL ON TABLE public.users TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES  TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES  TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS  TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS  TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES  TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES  TO service_role;


--
-- PostgreSQL database dump complete
--

