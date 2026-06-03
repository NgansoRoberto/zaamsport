--
-- PostgreSQL database dump
--

\restrict e358QKTuaXZDfcbHqoKupyOBjcfkWUjzpxUskurKfGGgV1dOkayfC20h9cgbyUn

-- Dumped from database version 16.14 (Ubuntu 16.14-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 17.10 (Ubuntu 17.10-1.pgdg24.04+1)

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
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.users VALUES (2, 'manager@fitaccess.com', '$2y$10$e0MYzXyjpJS7Pd0RVvHwHeuBf.8qYtE.0zFm5XVzEoZkI1qZGz7uy', 'manager', 'Dupont', 'Jean', '2026-05-25 13:52:52.894224');
INSERT INTO public.users VALUES (3, 'user@fitaccess.com', '$2y$10$9f6Yv9f6Yv9f6Yv9f6Yv9u', 'user', 'Martin', 'Sophie', '2026-05-25 13:52:52.894224');
INSERT INTO public.users VALUES (7, 'jordankenko5@gmail.com', '$2y$10$V.90sE7PQ1iHEZb.lxwRku3DApLORZAR0UWmg5U9LD/rfF2HSgqyy', 'user', 'kenko', 'sidoine', '2026-05-26 19:59:06.030558');
INSERT INTO public.users VALUES (9, 'admin@fitacess.com', '$2y$10$BD4OEI.E/6jOqRnpLZ1j7e.cUqHengn2JV9b6fCXdkQ5Y3ak9/kda', 'admin', 'kenko', 'sidoine', '2026-05-26 20:27:15.512301');
INSERT INTO public.users VALUES (10, 'urisrene@gmail.com', '$2y$10$nqbC7ExG3iYCyfE7SXQW7u2NzQ/Xxufw8LUelg56EVjgIZZ6nUBuC', 'manager', 'rene', 'uris', '2026-05-28 15:17:27.699813');
INSERT INTO public.users VALUES (11, 'junioralain@gmail.com', '$2y$10$K15jTvLTcVdy9/YVInTl4emiOl0.uV.YPfuemPz3NW8hMEH5T3u2a', 'user', 'alain', 'junior', '2026-05-30 13:59:08.289514');
INSERT INTO public.users VALUES (12, 'alesngo@gmail.com', '$2y$10$Qe4mdb9SVFqR4R5dHW1IPuTj2UGe7KaIf1a1fjIi0GmcFIR0vLXa2', 'user', 'ngo', 'ales', '2026-05-31 16:30:38.027748');
INSERT INTO public.users VALUES (13, 'idriss@gmail.com', '$2y$10$4BTBSUF9Wls2sg.LidUCfOleftcTOZ0iZh2oKA78nMIujCO4z2imq', 'manager', 'aimer', 'idriss', '2026-05-31 20:17:34.574298');
INSERT INTO public.users VALUES (14, 'brillantmokosah@gmail.com', '$2y$10$8zjzVw0TtPQThKZPpNMnq.9E3bB7X55w1Ma8RwehD1J3WoneSTUlG', 'user', 'moko sah ', 'bill brillant', '2026-06-02 17:28:11.015597');
INSERT INTO public.users VALUES (15, 'billmokosah@gmail.com', '$2y$10$8L8vCbz4t5/2vdF.ITZ/JuIVrEgJtAiD1luWaG5t8sPQdCoePTe6m', 'manager', 'moko sah', 'bill brillant', '2026-06-02 17:33:30.266272');
INSERT INTO public.users VALUES (16, 'admin@zaamsport.cm', '$2y$12$QlLNT9mhL12YbWnv.RQg8uYWj9GvGELAc5.WEXL7BaK7wX.W21ALC', 'admin', 'Admin', 'Super', '2026-06-03 10:40:47.213559');
INSERT INTO public.users VALUES (17, 'manager@zaamsport.cm', '$2y$12$cvLAtmtK8qnaU.Pt3TGeJupVPtdpSe5VgIYve.XRkocv8mALBuWHO', 'manager', 'Doe', 'John', '2026-06-03 10:40:47.44675');
INSERT INTO public.users VALUES (18, 'user@zaamsport.cm', '$2y$12$yvb3W87r1Bp437I8A.ZyZOdtWCTghyKtb.Vxlx4P3r.H1Ws0tEzjq', 'user', 'Test', 'Marie', '2026-06-03 10:40:47.681905');


--
-- Data for Name: fitness_centers; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.fitness_centers VALUES (9, 2, 'FitZone Bonapriso', 'Bonapriso, Douala, Cameroun', '0101000020E610000048E17A14AE67234007F01648503C1040', 'Salle de sport', true, 'approved', NULL, '{"friday": "6h-22h", "monday": "6h-22h", "sunday": "8h-18h", "tuesday": "6h-22h", "saturday": "8h-20h", "thursday": "6h-22h", "wednesday": "6h-22h"}', '{"single": "5000", "monthly": "25000", "coaching": "10000"}', 0.0, '2026-05-27 18:31:04.558643', 4.05890000, 9.70250000, '[]', '[]');
INSERT INTO public.fitness_centers VALUES (10, 2, 'AquaFit Akwa', 'Akwa, Douala, Cameroun', '0101000020E6100000E4141DC9E55F2340014D840D4F2F1040', 'Piscine', true, 'approved', NULL, '{"friday": "9h-21h", "monday": "9h-21h", "sunday": "10h-18h", "tuesday": "9h-21h", "saturday": "10h-20h", "thursday": "9h-21h", "wednesday": "9h-21h"}', '{"single": "7000", "monthly": "35000"}', 0.0, '2026-05-27 18:31:04.558643', 4.04620000, 9.68730000, '[]', '[]');
INSERT INTO public.fitness_centers VALUES (11, 2, 'CrossFit Bonamoussadi', 'Bonamoussadi, Douala, Cameroun', '0101000020E6100000F6285C8FC275234052B81E85EB511040', 'CrossFit', false, 'approved', NULL, '{"friday": "7h-20h", "monday": "7h-20h", "sunday": "Fermé", "tuesday": "7h-20h", "saturday": "8h-16h", "thursday": "7h-20h", "wednesday": "7h-20h"}', '{"single": "8000", "monthly": "40000"}', 0.0, '2026-05-27 18:31:04.558643', 4.08000000, 9.73000000, '[]', '[]');
INSERT INTO public.fitness_centers VALUES (12, 2, 'Yoga Studio Bali', 'Bali, Douala, Cameroun', '0101000020E61000003108AC1C5A642340105839B4C8361040', 'Yoga / Bien-être', true, 'approved', NULL, '{"friday": "8h-18h", "monday": "8h-20h", "sunday": "Fermé", "tuesday": "8h-20h", "saturday": "9h-17h", "thursday": "8h-20h", "wednesday": "8h-20h"}', '{"single": "4000", "monthly": "20000", "coaching": "7500"}', 0.0, '2026-05-27 18:31:04.558643', 4.05350000, 9.69600000, '[]', '[]');
INSERT INTO public.fitness_centers VALUES (13, 2, 'PowerGym Ndokoti', 'Ndokoti, Douala, Cameroun', '0101000020E61000007B14AE47E17A2340C3D32B6519221040', 'Musculation', false, 'approved', NULL, '{"friday": "5h-22h", "monday": "5h-22h", "sunday": "6h-18h", "tuesday": "5h-22h", "saturday": "6h-20h", "thursday": "5h-22h", "wednesday": "5h-22h"}', '{"single": "3000", "monthly": "15000"}', 5.0, '2026-05-27 18:31:04.558643', 4.03330000, 9.74000000, '[]', '[]');
INSERT INTO public.fitness_centers VALUES (15, 10, 'tresor hotel', 'pk8 entree laic', '0101000020E6100000241E9AC3FF832340E8D2646B22301040', 'Piscine', true, 'approved', NULL, '{"friday": "9h-21h", "monday": "9h-21h", "sunday": "ouvert", "tuesday": "9h-21h", "saturday": "10h-18h", "thursday": "9h-21h", "wednesday": "9h-21h"}', '{"single": "2000", "monthly": "10000", "coaching": "3000"}', 4.0, '2026-05-30 12:15:03.048666', 4.04700630, 9.75781070, '["Piscine"]', '["uploads/centers/6a1ac6b6bdb45_aset.jpg", "uploads/centers/6a1ac6b6c729e_asut.jpg", "uploads/centers/6a1ac6b6c9f2c_coaching.jpg", "uploads/centers/6a1ac6b6cd279_colect.jpg"]');


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.reviews VALUES (5, 9, 13, 5, 'gfggfdfddhghbbbgg', '2026-05-27 18:37:49.406871');
INSERT INTO public.reviews VALUES (6, 14, 15, 4, 'bien', '2026-06-02 17:30:46.974473');


--
-- Data for Name: spatial_ref_sys; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: user_profiles; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.user_profiles VALUES (1, 12, '0101000020E6100000969F1DD6437C2340DE6391C11B3A1040', '', 'Transport en commun', 'Prise de masse', '{Ascenseur,parking}', 'Moins de 2000f', 'Matin (6h-10h)', '2026-05-31 18:00:23.247722');
INSERT INTO public.user_profiles VALUES (2, 14, '0101000020E61000002A3927F6D07A23402E90A0F831361040', '', 'Voiture', 'Rééducation', '{parking}', 'Plus de 6000fcfa', 'Soir (18h-22h)', '2026-06-02 17:29:59.84495');
INSERT INTO public.user_profiles VALUES (3, 18, '0101000020E6100000AC0F351B757E2340A7F1C1210A541040', '', 'Marche', 'Perte de poids', '{"Accès PMR(acces pour les personnes à mobilités reduite)"}', '2000-4000f', 'Soir (18h-22h)', '2026-06-03 10:42:45.18217');


--
-- Name: fitness_centers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.fitness_centers_id_seq', 15, true);


--
-- Name: reviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.reviews_id_seq', 6, true);


--
-- Name: user_profiles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.user_profiles_id_seq', 3, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 18, true);


--
-- PostgreSQL database dump complete
--

\unrestrict e358QKTuaXZDfcbHqoKupyOBjcfkWUjzpxUskurKfGGgV1dOkayfC20h9cgbyUn

