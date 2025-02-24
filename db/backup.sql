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


--
-- Name: create_user_preferences(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_user_preferences() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    INSERT INTO user_preferences (user_id, theme_variant, custom_colors)
    VALUES (NEW.id, 'classic', null);
    RETURN NEW;
END;
$$;


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
    custom_colors jsonb,
    theme_mode text DEFAULT 'system'::text NOT NULL,
    background jsonb DEFAULT '{"url": "", "type": "none", "overlay": "0.85", "useLightTheme": false}'::jsonb NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    username text NOT NULL,
    password text NOT NULL,
    language text DEFAULT 'en'::text
);


--
-- Data for Name: game_states; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.game_states (id, user_id, stats, inventory, event_log, saved_at, character_name, character_description, main_quest, side_quests) FROM stdin;
78e51ffc-a431-478e-9bfd-f0eb158c28d4	f7ea2127-8cc7-4d80-a22f-db8318493b7e	[{"name": "Santé", "value": 0, "config": {"max": 100, "type": "progress", "color": "#ef4444"}}, {"name": "Mana", "value": 0, "config": {"max": 100, "type": "progress", "color": "#3b82f6"}}, {"name": "Niveau", "value": 0, "config": {"type": "number"}}]	[]	[]	2025-02-21T23:43:47.466Z			{"title": "", "status": "Not started", "description": ""}	[]
dd17577e-3276-4ae9-b781-64fe7976aced	f7ea2127-8cc7-4d80-a22f-db8318493b7e	[{"name": "Santé", "value": "80", "config": {"max": 100, "type": "progress", "color": "#ef4444"}}, {"name": "Mana", "value": 30, "config": {"max": 100, "type": "progress", "color": "#3b82f6"}}, {"name": "Niveau", "value": 1, "config": {"type": "number"}}]	[]	[]	2025-02-22T14:03:20.411Z	Pierre		{"title": "", "status": "Not started", "description": ""}	[]
7cc6884e-dac3-4aea-91b8-391c2b50f40f	f7ea2127-8cc7-4d80-a22f-db8318493b7e	[{"name": "Santé", "value": 0, "config": {"max": 100, "type": "progress", "color": "#ef4444"}}, {"name": "Mana", "value": 0, "config": {"max": 100, "type": "progress", "color": "#3b82f6"}}, {"name": "Niveau", "value": 0, "config": {"type": "number"}}]	[]	[]	2025-02-23T12:08:39.926Z			{"title": "", "status": "Not started", "description": ""}	[]
a63eb302-0ea2-412e-b68f-0ef9e3f208d8	f7ea2127-8cc7-4d80-a22f-db8318493b7e	[{"name": "Santé", "value": 0, "config": {"max": 100, "type": "progress", "color": "#ef4444"}}, {"name": "Mana", "value": 0, "config": {"max": 100, "type": "progress", "color": "#3b82f6"}}, {"name": "Niveau", "value": 0, "config": {"type": "number"}}]	[]	[]	2025-02-23T15:25:47.185Z			{"title": "", "status": "Not started", "description": ""}	[]
\.


--
-- Data for Name: games; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.games (id, user_id, game_state_id, conversation, created_at, updated_at, name, description) FROM stdin;
59a3e65a-94f1-4c2b-94af-3bf5b1678ad6	f7ea2127-8cc7-4d80-a22f-db8318493b7e	dd17577e-3276-4ae9-b781-64fe7976aced	{"messages": [{"role": "user", "content": "test", "timestamp": "2025-02-21T15:47:24.237Z"}, {"role": "assistant", "content": "<response>\\n  <stats>\\n    <health>0</health>\\n    <mana>0</mana>\\n    <level>0</level>\\n  </stats>\\n  <character>\\n    <name>Sans nom</name>\\n    <description>Aucune description</description>\\n  </character>\\n  <quests>\\n    <mainQuest>\\n      <title>Aucune</title>\\n      <description>Aucune description</description>\\n      <status>Not started</status>\\n    </mainQuest>\\n  </quests>\\n  <inventory>\\n    <item1></item1>\\n    <item2></item2>\\n  </inventory>\\n  <eventLog>\\n    <event1></event1>\\n    <event2></event2>\\n  </eventLog>\\n  <message>Bienvenue dans cette aventure interactive ! Pour commencer, veuillez choisir un nom et une description pour votre personnage, et enregistrer votre partie.</message>\\n</response>", "timestamp": "2025-02-21T15:47:25.399Z"}, {"role": "user", "content": "on peut commencer", "timestamp": "2025-02-21T15:47:57.916Z"}, {"role": "assistant", "content": "<response>\\n  <stats>\\n    <health>0</health>\\n    <mana>0</mana>\\n    <level>0</level>\\n  </stats>\\n  <character>\\n    <name>pierre</name>\\n    <description>l'homme de feu</description>\\n  </character>\\n  <quests>\\n    <mainQuest>\\n      <title>Aucune</title>\\n      <description>Aucune description</description>\\n      <status>Not started</status>\\n    </mainQuest>\\n  </quests>\\n  <inventory>\\n    <item1></item1>\\n    <item2></item2>\\n  </inventory>\\n  <eventLog>\\n    <event1></event1>\\n    <event2></event2>\\n  </eventLog>\\n  <message>Vous êtes <character><name>pierre</name></character>, l'homme de feu. Votre aventure vous attend. Que souhaitez-vous faire ?</message>\\n</response>", "timestamp": "2025-02-21T15:47:58.737Z"}, {"role": "user", "content": "invente une situation initiale", "timestamp": "2025-02-21T15:49:36.924Z"}, {"role": "assistant", "content": "<response>\\n  <stats>\\n    <health>50</health>\\n    <mana>30</mana>\\n    <level>1</level>\\n  </stats>\\n  <character>\\n    <name>pierre</name>\\n    <description>l'homme de feu</description>\\n  </character>\\n  <quests>\\n    <mainQuest>\\n      <title>rencontrer les anciens</title>\\n      <description>Qui sont ces mystérieux anciens ?</description>\\n      <status>Not started</status>\\n    </mainQuest>\\n  </quests>\\n  <inventory>\\n    <item1></item1>\\n    <item2></item2>\\n  </inventory>\\n  <eventLog>\\n    <event1></event1>\\n    <event2></event2>\\n  </eventLog>\\n  <message>Un jour, alors que vous étiez en train de méditer dans votre maison, une lumière éblouissante a soudain rempli la pièce. Lorsque la lumière s'est dissipée, vous avez vu une apparition d'un ancien qui vous a confié la quête de rencontrer les autres anciens. Où pouvez-vous commencer votre recherche ?</message>\\n</response>", "timestamp": "2025-02-21T15:49:37.954Z"}], "timestamp": "2025-02-22T14:03:20.257Z"}	2025-02-21 15:47:17.92391+00	2025-02-23 09:54:42.377+00	ça va en vrai	tout va bien
12dbc14d-350e-42ca-99cb-30f29b9a384e	f7ea2127-8cc7-4d80-a22f-db8318493b7e	78e51ffc-a431-478e-9bfd-f0eb158c28d4	{"messages": [{"role": "user", "content": "on joue", "timestamp": "2025-02-21T23:43:46.346Z"}, {"role": "assistant", "content": "<response>\\n  <stats>\\n    <health>0</health>\\n    <mana>0</mana>\\n    <level>0</level>\\n  </stats>\\n  <character>\\n    <name>Sans nom</name>\\n    <description>Aucune description</description>\\n  </character>\\n  <quests>\\n    <mainQuest>\\n      <title>Aucun titre</title>\\n      <description>Aucune description</description>\\n      <status>Not started</status>\\n    </mainQuest>\\n  </quests>\\n  <inventory>\\n    <item1></item1>\\n    <item2></item2>\\n  </inventory>\\n  <eventLog>\\n    <event1></event1>\\n    <event2></event2>\\n  </eventLog>\\n  <message>Bienvenue dans ce monde d'aventure ! Votre voyage ne pourra commencer qu'une fois que vous aurez choisi un nom et une description pour votre personnage. N'oubliez pas de sauvegarder votre partie une fois que vous aurez terminé.</message>\\n</response>", "timestamp": "2025-02-21T23:43:47.405Z"}], "timestamp": "2025-02-21T23:43:47.405Z"}	2025-02-21 23:43:47.697831+00	2025-02-23 15:10:36.35+00	first	
b76186d9-aa11-42a3-9389-39ffca2e4d54	f7ea2127-8cc7-4d80-a22f-db8318493b7e	a63eb302-0ea2-412e-b68f-0ef9e3f208d8	{"messages": [{"role": "user", "content": "bonjour", "timestamp": "2025-02-23T15:25:46.142Z"}, {"role": "assistant", "content": "<response>\\n  <stats>\\n    <health>0</health>\\n    <mana>0</mana>\\n    <level>0</level>\\n  </stats>\\n  <character>\\n    <name>Sans nom</name>\\n    <description>Aucune description</description>\\n  </character>\\n  <quests>\\n    <mainQuest>\\n      <title>Aucune</title>\\n      <description>Aucune</description>\\n      <status>Not started</status>\\n    </mainQuest>\\n  </quests>\\n  <inventory>\\n    <item1></item1>\\n    <item2></item2>\\n  </inventory>\\n  <eventLog>\\n    <event1></event1>\\n    <event2></event2>\\n  </eventLog>\\n  <message>\\n  Bonjour! Il semble que vous n'ayez pas encore commencé votre aventure. Pour commencer, vous devriez peut-être vous donner un nom et une description, et peut-être même une quête à accomplir. N'oubliez pas de sauvegarder votre partie une fois que vous avez terminé.\\n  </message>\\n</response>", "timestamp": "2025-02-23T15:25:47.120Z"}], "timestamp": "2025-02-23T15:25:47.120Z"}	2025-02-23 15:25:47.247549+00	2025-02-23 15:25:47.247549+00	test	
af912275-2658-40fa-8962-de4817a80929	f7ea2127-8cc7-4d80-a22f-db8318493b7e	7cc6884e-dac3-4aea-91b8-391c2b50f40f	{"messages": [{"role": "user", "content": "Jouons à jeu de rôle qui serait une alégorie du développement web", "timestamp": "2025-02-23T12:05:39.025Z"}, {"role": "assistant", "content": "<response>\\n  <stats>\\n    <health>0</health>\\n    <mana>0</mana>\\n    <level>0</level>\\n  </stats>\\n  <character>\\n    <name>Sans nom</name>\\n    <description>Aucune description</description>\\n  </character>\\n  <quests>\\n    <mainQuest>\\n      <title>Aucune</title>\\n      <description>Aucune</description>\\n      <status>Not started</status>\\n    </mainQuest>\\n  </quests>\\n  <inventory>\\n    <item1></item1>\\n    <item2></item2>\\n  </inventory>\\n  <eventLog>\\n    <event1></event1>\\n    <event2></event2>\\n  </eventLog>\\n  <message>\\n    Bienvenue dans notre jeu de rôle qui symbolise le développement web ! Pour commencer, veuillez me fournir une description et un nom pour votre personnage. Ensuite, nous pourrons définir une quête principale et vous équiper pour votre aventure.\\n  </message>\\n</response>", "timestamp": "2025-02-23T12:05:40.487Z"}, {"role": "user", "content": "voilà j'ai fait un petit set up ça te va ?", "timestamp": "2025-02-23T12:08:18.284Z"}, {"role": "assistant", "content": "Bien sûr, je vois que vous avez initialisé votre personnage avec un nom et une description, ainsi qu'une quête principale et un inventaire. Voici la nouvelle présentation de l'état actuel de votre personnage :\\n\\n<response>\\n  <stats>\\n    <health>0</health>\\n    <mana>0</mana>\\n    <level>0</level>\\n  </stats>\\n  <character>\\n    <name>pogo</name>\\n    <description>Aucune description</description>\\n  </character>\\n  <quests>\\n    <mainQuest>\\n      <title>comprendre le serpent python</title>\\n      <description>ce serpent versatile est capable de bien des choses</description>\\n      <status>Not started</status>\\n    </mainQuest>\\n  </quests>\\n  <inventory>\\n    <item1>clavier</item1>\\n    <item2>souris</item2>\\n  </inventory>\\n  <eventLog>\\n    <event1></event1>\\n    <event2></event2>\\n  </eventLog>\\n  <message>\\n    Vous êtes maintenant prêt(e) à entamer votre aventure en tant que pogo, dans le monde du développement web. Votre quête principale consiste à comprendre le serpent python, un élément versatile et puissant dans ce monde. Votre inventaire contient un clavier et une souris, qui vous seront utiles pour votre quête. N'hésitez pas à explorer et à interagir avec votre environnement.\\n  </message>\\n</response>", "timestamp": "2025-02-23T12:08:19.559Z"}, {"role": "user", "content": "quel est mon environnement ?", "timestamp": "2025-02-23T12:08:38.082Z"}, {"role": "assistant", "content": "Votre environnement actuel est un monde abstrait représentant le développement web. Il s'agit d'un espace virtuel où vous pouvez rencontrer différents éléments et challenges liés au développement web, tels que des langages de programmation, des frameworks, des algorithmes et d'autres concepts.\\n\\nVous êtes équipé d'un clavier et d'une souris dans votre inventaire, qui sont les outils de base pour interagir avec cet environnement. Vous êtes également en quête de comprendre le serpent python, qui symbolise un langage de programmation polyvalent et puissant dans le développement web.\\n\\nN'hésitez pas à explorer et à interagir avec votre environnement pour en apprendre davantage et progresser dans votre quête.\\n\\n<response>\\n  <stats>\\n    <health>0</health>\\n    <mana>0</mana>\\n    <level>0</level>\\n  </stats>\\n  <character>\\n    <name>pogo</name>\\n    <description>Aucune description</description>\\n  </character>\\n  <quests>\\n    <mainQuest>\\n      <title>comprendre le serpent python</title>\\n      <description>ce serpent versatile est capable de bien des choses</description>\\n      <status>Not started</status>\\n    </mainQuest>\\n  </quests>\\n  <inventory>\\n    <item1>clavier</item1>\\n    <item2>souris</item2>\\n  </inventory>\\n  <eventLog>\\n    <event1></event1>\\n    <event2></event2>\\n  </eventLog>\\n  <message>\\n    Votre environnement actuel est un monde abstrait représentant le développement web. Vous êtes équipé d'un clavier et d'une souris, et votre quête principale est de comprendre le serpent python. N'hésitez pas à explorer et à interagir avec votre environnement pour en apprendre davantage et progresser dans votre quête.\\n  </message>\\n</response>", "timestamp": "2025-02-23T12:08:39.532Z"}], "timestamp": "2025-02-23T12:08:39.693Z"}	2025-02-23 12:05:40.667963+00	2025-02-23 18:09:36.932+00	Perdu dans les lignes de code	
\.


--
-- Data for Name: session; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.session (sid, sess, expire) FROM stdin;
uPWy8S1taXSS_O1slt1C072gTcq3d3hp	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"},"passport":{"user":"f7ea2127-8cc7-4d80-a22f-db8318493b7e"}}	2025-02-25 00:10:01
8F3vAUtX07Y3XCHGFqxRHbUa2-NCW0ox	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"},"passport":{"user":"f7ea2127-8cc7-4d80-a22f-db8318493b7e"}}	2025-02-25 10:11:33
EC_-VSQRufElWBS3i4EjVZ9ajSvjBEvQ	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"},"passport":{"user":"f7ea2127-8cc7-4d80-a22f-db8318493b7e"}}	2025-02-25 10:11:50
vPJ2cGWay4jHr-re8p4pjthmHpL-eU1l	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"},"passport":{"user":"f7ea2127-8cc7-4d80-a22f-db8318493b7e"}}	2025-02-24 13:00:47
PexPkuAnfnh4aAinS5kN02YEFJI3phlF	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"},"passport":{"user":"f7ea2127-8cc7-4d80-a22f-db8318493b7e"}}	2025-02-24 20:07:56
zK57cEe0htkKXU6ucuBtSKN1N9pYPmQX	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"},"passport":{"user":"f7ea2127-8cc7-4d80-a22f-db8318493b7e"}}	2025-02-24 20:41:12
D-4X-I_hV3eLwhX3RbFe-umDrBVpGEn2	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"},"passport":{"user":"f7ea2127-8cc7-4d80-a22f-db8318493b7e"}}	2025-02-25 07:05:13
\.


--
-- Data for Name: user_preferences; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_preferences (user_id, theme_variant, theme_colors, created_at, updated_at, custom_colors, theme_mode, background) FROM stdin;
8ac7666a-768f-496b-b219-434feb02c1d8	classic	{"primary": null, "secondary": null}	2025-02-23 11:17:14.836762+00	2025-02-23 11:17:14.836762+00	\N	system	{"url": "", "type": "none", "overlay": "0.85", "useLightTheme": false}
f7ea2127-8cc7-4d80-a22f-db8318493b7e	classic	{"primary": null, "secondary": null}	2025-02-23 11:17:14.836762+00	2025-02-24 10:10:01.114+00	{"primary": "0 59% 58%", "secondary": "67 68% 46%"}	dark	{"url": "", "type": "none", "overlay": "0.85", "useLightTheme": false}
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, username, password, language) FROM stdin;
f7ea2127-8cc7-4d80-a22f-db8318493b7e	etienne	52206d313bb17918060d6c9522c155b357e204efae84b29b0d0edb6a536aab7cf1a26dd5c3034743d71bdcb4328d6d64cc6f9c019c51af37934306db32e3d045.6e57b4acc7af2da9d9b367c82b33e2d0	en
8ac7666a-768f-496b-b219-434feb02c1d8	etienne5	0e55f97ca9c409b98c2ad145c01214182b413068bcbd46d4ca624a59d2282d2a71a71cfb6dc53e23ccda8ef72f45869b23e9364a2e00149a0be250ae347268db.df5958da63e6f67afa29feef684dec42	en
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
-- Name: users on_user_created; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER on_user_created AFTER INSERT ON public.users FOR EACH ROW EXECUTE FUNCTION public.create_user_preferences();


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

