toc.dat                                                                                             0000600 0004000 0002000 00000045555 14710105346 0014456 0                                                                                                    ustar 00postgres                        postgres                        0000000 0000000                                                                                                                                                                        PGDMP   7                	    |            ack_db_z975    16.3 (Debian 16.3-1.pgdg120+1)    16.3 A    i           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                      false         j           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                      false         k           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                      false         l           1262    16389    ack_db_z975    DATABASE     v   CREATE DATABASE ack_db_z975 WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en_US.UTF8';
    DROP DATABASE ack_db_z975;
                ack_db_z975_user    false         m           0    0    ack_db_z975    DATABASE PROPERTIES     4   ALTER DATABASE ack_db_z975 SET "TimeZone" TO 'utc';
                     ack_db_z975_user    false         �            1259    16547    actualcastings    TABLE       CREATE TABLE public.actualcastings (
    id integer NOT NULL,
    daily_report_id integer NOT NULL,
    casted_amount integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_by integer,
    remarks text,
    casted_volume numeric
);
 "   DROP TABLE public.actualcastings;
       public         heap    ack_db_z975_user    false         �            1259    16546    actualcastings_id_seq    SEQUENCE     �   CREATE SEQUENCE public.actualcastings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 ,   DROP SEQUENCE public.actualcastings_id_seq;
       public          ack_db_z975_user    false    226         n           0    0    actualcastings_id_seq    SEQUENCE OWNED BY     O   ALTER SEQUENCE public.actualcastings_id_seq OWNED BY public.actualcastings.id;
          public          ack_db_z975_user    false    225         �            1259    16517    dailyreports    TABLE     �  CREATE TABLE public.dailyreports (
    id integer NOT NULL,
    date date NOT NULL,
    user_id integer NOT NULL,
    job_id integer NOT NULL,
    table_id integer NOT NULL,
    element_id integer NOT NULL,
    mep text,
    remarks text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    status public.report_status DEFAULT 'pending'::public.report_status
);
     DROP TABLE public.dailyreports;
       public         heap    ack_db_z975_user    false         �            1259    16516    dailyreports_id_seq    SEQUENCE     �   CREATE SEQUENCE public.dailyreports_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 *   DROP SEQUENCE public.dailyreports_id_seq;
       public          ack_db_z975_user    false    224         o           0    0    dailyreports_id_seq    SEQUENCE OWNED BY     K   ALTER SEQUENCE public.dailyreports_id_seq OWNED BY public.dailyreports.id;
          public          ack_db_z975_user    false    223         �            1259    16508    elements    TABLE     �   CREATE TABLE public.elements (
    id integer NOT NULL,
    element_id character varying(20) NOT NULL,
    volume numeric(10,2) NOT NULL,
    weight numeric(10,2) NOT NULL
);
    DROP TABLE public.elements;
       public         heap    ack_db_z975_user    false         �            1259    16507    elements_id_seq    SEQUENCE     �   CREATE SEQUENCE public.elements_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 &   DROP SEQUENCE public.elements_id_seq;
       public          ack_db_z975_user    false    222         p           0    0    elements_id_seq    SEQUENCE OWNED BY     C   ALTER SEQUENCE public.elements_id_seq OWNED BY public.elements.id;
          public          ack_db_z975_user    false    221         �            1259    16486    jobs    TABLE     {   CREATE TABLE public.jobs (
    id integer NOT NULL,
    job_number character varying(20) NOT NULL,
    description text
);
    DROP TABLE public.jobs;
       public         heap    ack_db_z975_user    false         �            1259    16485    jobs_id_seq    SEQUENCE     �   CREATE SEQUENCE public.jobs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 "   DROP SEQUENCE public.jobs_id_seq;
       public          ack_db_z975_user    false    218         q           0    0    jobs_id_seq    SEQUENCE OWNED BY     ;   ALTER SEQUENCE public.jobs_id_seq OWNED BY public.jobs.id;
          public          ack_db_z975_user    false    217         �            1259    16585    planned_castings    TABLE       CREATE TABLE public.planned_castings (
    id integer NOT NULL,
    element_id integer NOT NULL,
    planned_volume numeric(10,2) NOT NULL,
    planned_date date NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    planned_amount integer
);
 $   DROP TABLE public.planned_castings;
       public         heap    ack_db_z975_user    false         �            1259    16584    planned_castings_id_seq    SEQUENCE     �   CREATE SEQUENCE public.planned_castings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 .   DROP SEQUENCE public.planned_castings_id_seq;
       public          ack_db_z975_user    false    228         r           0    0    planned_castings_id_seq    SEQUENCE OWNED BY     S   ALTER SEQUENCE public.planned_castings_id_seq OWNED BY public.planned_castings.id;
          public          ack_db_z975_user    false    227         �            1259    16497    tables    TABLE        CREATE TABLE public.tables (
    id integer NOT NULL,
    table_number character varying(20) NOT NULL,
    description text
);
    DROP TABLE public.tables;
       public         heap    ack_db_z975_user    false         �            1259    16496    tables_id_seq    SEQUENCE     �   CREATE SEQUENCE public.tables_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 $   DROP SEQUENCE public.tables_id_seq;
       public          ack_db_z975_user    false    220         s           0    0    tables_id_seq    SEQUENCE OWNED BY     ?   ALTER SEQUENCE public.tables_id_seq OWNED BY public.tables.id;
          public          ack_db_z975_user    false    219         �            1259    16475    users    TABLE     �  CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    password_hash character varying(255) NOT NULL,
    role character varying(20) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['manager'::character varying, 'planned_employee'::character varying, 'actual_employee'::character varying])::text[])))
);
    DROP TABLE public.users;
       public         heap    ack_db_z975_user    false         �            1259    16474    users_id_seq    SEQUENCE     �   CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 #   DROP SEQUENCE public.users_id_seq;
       public          ack_db_z975_user    false    216         t           0    0    users_id_seq    SEQUENCE OWNED BY     =   ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;
          public          ack_db_z975_user    false    215         �           2604    16550    actualcastings id    DEFAULT     v   ALTER TABLE ONLY public.actualcastings ALTER COLUMN id SET DEFAULT nextval('public.actualcastings_id_seq'::regclass);
 @   ALTER TABLE public.actualcastings ALTER COLUMN id DROP DEFAULT;
       public          ack_db_z975_user    false    225    226    226         �           2604    16520    dailyreports id    DEFAULT     r   ALTER TABLE ONLY public.dailyreports ALTER COLUMN id SET DEFAULT nextval('public.dailyreports_id_seq'::regclass);
 >   ALTER TABLE public.dailyreports ALTER COLUMN id DROP DEFAULT;
       public          ack_db_z975_user    false    224    223    224         �           2604    16511    elements id    DEFAULT     j   ALTER TABLE ONLY public.elements ALTER COLUMN id SET DEFAULT nextval('public.elements_id_seq'::regclass);
 :   ALTER TABLE public.elements ALTER COLUMN id DROP DEFAULT;
       public          ack_db_z975_user    false    222    221    222         �           2604    16489    jobs id    DEFAULT     b   ALTER TABLE ONLY public.jobs ALTER COLUMN id SET DEFAULT nextval('public.jobs_id_seq'::regclass);
 6   ALTER TABLE public.jobs ALTER COLUMN id DROP DEFAULT;
       public          ack_db_z975_user    false    217    218    218         �           2604    16588    planned_castings id    DEFAULT     z   ALTER TABLE ONLY public.planned_castings ALTER COLUMN id SET DEFAULT nextval('public.planned_castings_id_seq'::regclass);
 B   ALTER TABLE public.planned_castings ALTER COLUMN id DROP DEFAULT;
       public          ack_db_z975_user    false    227    228    228         �           2604    16500 	   tables id    DEFAULT     f   ALTER TABLE ONLY public.tables ALTER COLUMN id SET DEFAULT nextval('public.tables_id_seq'::regclass);
 8   ALTER TABLE public.tables ALTER COLUMN id DROP DEFAULT;
       public          ack_db_z975_user    false    219    220    220         �           2604    16478    users id    DEFAULT     d   ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);
 7   ALTER TABLE public.users ALTER COLUMN id DROP DEFAULT;
       public          ack_db_z975_user    false    215    216    216         d          0    16547    actualcastings 
   TABLE DATA                 public          ack_db_z975_user    false    226       3428.dat b          0    16517    dailyreports 
   TABLE DATA                 public          ack_db_z975_user    false    224       3426.dat `          0    16508    elements 
   TABLE DATA                 public          ack_db_z975_user    false    222       3424.dat \          0    16486    jobs 
   TABLE DATA                 public          ack_db_z975_user    false    218       3420.dat f          0    16585    planned_castings 
   TABLE DATA                 public          ack_db_z975_user    false    228       3430.dat ^          0    16497    tables 
   TABLE DATA                 public          ack_db_z975_user    false    220       3422.dat Z          0    16475    users 
   TABLE DATA                 public          ack_db_z975_user    false    216       3418.dat u           0    0    actualcastings_id_seq    SEQUENCE SET     C   SELECT pg_catalog.setval('public.actualcastings_id_seq', 5, true);
          public          ack_db_z975_user    false    225         v           0    0    dailyreports_id_seq    SEQUENCE SET     A   SELECT pg_catalog.setval('public.dailyreports_id_seq', 9, true);
          public          ack_db_z975_user    false    223         w           0    0    elements_id_seq    SEQUENCE SET     =   SELECT pg_catalog.setval('public.elements_id_seq', 7, true);
          public          ack_db_z975_user    false    221         x           0    0    jobs_id_seq    SEQUENCE SET     9   SELECT pg_catalog.setval('public.jobs_id_seq', 5, true);
          public          ack_db_z975_user    false    217         y           0    0    planned_castings_id_seq    SEQUENCE SET     E   SELECT pg_catalog.setval('public.planned_castings_id_seq', 6, true);
          public          ack_db_z975_user    false    227         z           0    0    tables_id_seq    SEQUENCE SET     ;   SELECT pg_catalog.setval('public.tables_id_seq', 5, true);
          public          ack_db_z975_user    false    219         {           0    0    users_id_seq    SEQUENCE SET     :   SELECT pg_catalog.setval('public.users_id_seq', 9, true);
          public          ack_db_z975_user    false    215         �           2606    16553 "   actualcastings actualcastings_pkey 
   CONSTRAINT     `   ALTER TABLE ONLY public.actualcastings
    ADD CONSTRAINT actualcastings_pkey PRIMARY KEY (id);
 L   ALTER TABLE ONLY public.actualcastings DROP CONSTRAINT actualcastings_pkey;
       public            ack_db_z975_user    false    226         �           2606    16525    dailyreports dailyreports_pkey 
   CONSTRAINT     \   ALTER TABLE ONLY public.dailyreports
    ADD CONSTRAINT dailyreports_pkey PRIMARY KEY (id);
 H   ALTER TABLE ONLY public.dailyreports DROP CONSTRAINT dailyreports_pkey;
       public            ack_db_z975_user    false    224         �           2606    16515     elements elements_element_id_key 
   CONSTRAINT     a   ALTER TABLE ONLY public.elements
    ADD CONSTRAINT elements_element_id_key UNIQUE (element_id);
 J   ALTER TABLE ONLY public.elements DROP CONSTRAINT elements_element_id_key;
       public            ack_db_z975_user    false    222         �           2606    16513    elements elements_pkey 
   CONSTRAINT     T   ALTER TABLE ONLY public.elements
    ADD CONSTRAINT elements_pkey PRIMARY KEY (id);
 @   ALTER TABLE ONLY public.elements DROP CONSTRAINT elements_pkey;
       public            ack_db_z975_user    false    222         �           2606    16495    jobs jobs_job_number_key 
   CONSTRAINT     Y   ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_job_number_key UNIQUE (job_number);
 B   ALTER TABLE ONLY public.jobs DROP CONSTRAINT jobs_job_number_key;
       public            ack_db_z975_user    false    218         �           2606    16493    jobs jobs_pkey 
   CONSTRAINT     L   ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_pkey PRIMARY KEY (id);
 8   ALTER TABLE ONLY public.jobs DROP CONSTRAINT jobs_pkey;
       public            ack_db_z975_user    false    218         �           2606    16591 &   planned_castings planned_castings_pkey 
   CONSTRAINT     d   ALTER TABLE ONLY public.planned_castings
    ADD CONSTRAINT planned_castings_pkey PRIMARY KEY (id);
 P   ALTER TABLE ONLY public.planned_castings DROP CONSTRAINT planned_castings_pkey;
       public            ack_db_z975_user    false    228         �           2606    16504    tables tables_pkey 
   CONSTRAINT     P   ALTER TABLE ONLY public.tables
    ADD CONSTRAINT tables_pkey PRIMARY KEY (id);
 <   ALTER TABLE ONLY public.tables DROP CONSTRAINT tables_pkey;
       public            ack_db_z975_user    false    220         �           2606    16506    tables tables_table_number_key 
   CONSTRAINT     a   ALTER TABLE ONLY public.tables
    ADD CONSTRAINT tables_table_number_key UNIQUE (table_number);
 H   ALTER TABLE ONLY public.tables DROP CONSTRAINT tables_table_number_key;
       public            ack_db_z975_user    false    220         �           2606    16482    users users_pkey 
   CONSTRAINT     N   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);
 :   ALTER TABLE ONLY public.users DROP CONSTRAINT users_pkey;
       public            ack_db_z975_user    false    216         �           2606    16484    users users_username_key 
   CONSTRAINT     W   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);
 B   ALTER TABLE ONLY public.users DROP CONSTRAINT users_username_key;
       public            ack_db_z975_user    false    216         �           2606    16554 2   actualcastings actualcastings_daily_report_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.actualcastings
    ADD CONSTRAINT actualcastings_daily_report_id_fkey FOREIGN KEY (daily_report_id) REFERENCES public.dailyreports(id);
 \   ALTER TABLE ONLY public.actualcastings DROP CONSTRAINT actualcastings_daily_report_id_fkey;
       public          ack_db_z975_user    false    224    226    3262         �           2606    16602 *   actualcastings actualcastings_user_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.actualcastings
    ADD CONSTRAINT actualcastings_user_id_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id);
 T   ALTER TABLE ONLY public.actualcastings DROP CONSTRAINT actualcastings_user_id_fkey;
       public          ack_db_z975_user    false    226    216    3246         �           2606    16541 )   dailyreports dailyreports_element_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.dailyreports
    ADD CONSTRAINT dailyreports_element_id_fkey FOREIGN KEY (element_id) REFERENCES public.elements(id);
 S   ALTER TABLE ONLY public.dailyreports DROP CONSTRAINT dailyreports_element_id_fkey;
       public          ack_db_z975_user    false    3260    224    222         �           2606    16531 %   dailyreports dailyreports_job_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.dailyreports
    ADD CONSTRAINT dailyreports_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id);
 O   ALTER TABLE ONLY public.dailyreports DROP CONSTRAINT dailyreports_job_id_fkey;
       public          ack_db_z975_user    false    3252    218    224         �           2606    16536 '   dailyreports dailyreports_table_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.dailyreports
    ADD CONSTRAINT dailyreports_table_id_fkey FOREIGN KEY (table_id) REFERENCES public.tables(id);
 Q   ALTER TABLE ONLY public.dailyreports DROP CONSTRAINT dailyreports_table_id_fkey;
       public          ack_db_z975_user    false    224    3254    220         �           2606    16526 &   dailyreports dailyreports_user_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.dailyreports
    ADD CONSTRAINT dailyreports_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);
 P   ALTER TABLE ONLY public.dailyreports DROP CONSTRAINT dailyreports_user_id_fkey;
       public          ack_db_z975_user    false    216    224    3246         �           2606    16592 1   planned_castings planned_castings_element_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.planned_castings
    ADD CONSTRAINT planned_castings_element_id_fkey FOREIGN KEY (element_id) REFERENCES public.elements(id);
 [   ALTER TABLE ONLY public.planned_castings DROP CONSTRAINT planned_castings_element_id_fkey;
       public          ack_db_z975_user    false    3260    222    228                                                                                                                                                           3428.dat                                                                                            0000600 0004000 0002000 00000002026 14710105347 0014254 0                                                                                                    ustar 00postgres                        postgres                        0000000 0000000                                                                                                                                                                        INSERT INTO public.actualcastings (id, daily_report_id, casted_amount, created_at, updated_by, remarks, casted_volume) VALUES (1, 3, 1, '2024-10-21 17:25:41.820983', NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO public.actualcastings (id, daily_report_id, casted_amount, created_at, updated_by, remarks, casted_volume) VALUES (2, 4, 1, '2024-10-21 17:25:41.820983', NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO public.actualcastings (id, daily_report_id, casted_amount, created_at, updated_by, remarks, casted_volume) VALUES (3, 8, 3, '2024-10-27 18:37:35.476138', NULL, 'todays job', 1) ON CONFLICT DO NOTHING;
INSERT INTO public.actualcastings (id, daily_report_id, casted_amount, created_at, updated_by, remarks, casted_volume) VALUES (4, 9, 3, '2024-10-29 07:04:18.629582', NULL, 'Done', 1.5) ON CONFLICT DO NOTHING;
INSERT INTO public.actualcastings (id, daily_report_id, casted_amount, created_at, updated_by, remarks, casted_volume) VALUES (5, 7, 3, '2024-10-29 07:05:04.564004', NULL, '', 0.35) ON CONFLICT DO NOTHING;


                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          3426.dat                                                                                            0000600 0004000 0002000 00000003611 14710105351 0014246 0                                                                                                    ustar 00postgres                        postgres                        0000000 0000000                                                                                                                                                                        INSERT INTO public.dailyreports (id, date, user_id, job_id, table_id, element_id, mep, remarks, created_at, status) VALUES (1, '2024-10-04', 1, 1, 1, 1, 'MEP', 'Sample remark 1', '2024-10-21 17:25:41.820983', 'pending') ON CONFLICT DO NOTHING;
INSERT INTO public.dailyreports (id, date, user_id, job_id, table_id, element_id, mep, remarks, created_at, status) VALUES (2, '2024-10-04', 1, 1, 2, 2, 'MEP', 'Sample remark 2', '2024-10-21 17:25:41.820983', 'pending') ON CONFLICT DO NOTHING;
INSERT INTO public.dailyreports (id, date, user_id, job_id, table_id, element_id, mep, remarks, created_at, status) VALUES (3, '2024-10-04', 1, 1, 3, 4, 'MEP', 'Sample remark 3', '2024-10-21 17:25:41.820983', 'pending') ON CONFLICT DO NOTHING;
INSERT INTO public.dailyreports (id, date, user_id, job_id, table_id, element_id, mep, remarks, created_at, status) VALUES (4, '2024-10-04', 1, 1, 1, 5, 'MEP', 'Sample remark 4', '2024-10-21 17:25:41.820983', 'pending') ON CONFLICT DO NOTHING;
INSERT INTO public.dailyreports (id, date, user_id, job_id, table_id, element_id, mep, remarks, created_at, status) VALUES (6, '2024-10-22', 1, 1, 2, 3, 'yes', 'Planned cast for today', '2024-10-23 08:40:40.874461', 'pending') ON CONFLICT DO NOTHING;
INSERT INTO public.dailyreports (id, date, user_id, job_id, table_id, element_id, mep, remarks, created_at, status) VALUES (7, '2024-10-26', 8, 2, 4, 3, NULL, NULL, '2024-10-26 16:27:07.712198', 'pending') ON CONFLICT DO NOTHING;
INSERT INTO public.dailyreports (id, date, user_id, job_id, table_id, element_id, mep, remarks, created_at, status) VALUES (8, '2024-10-27', 8, 1, 1, 2, 'MEP', 'None', '2024-10-27 18:22:33.001282', 'completed') ON CONFLICT DO NOTHING;
INSERT INTO public.dailyreports (id, date, user_id, job_id, table_id, element_id, mep, remarks, created_at, status) VALUES (9, '2024-10-28', 8, 2, 3, 1, 'MEP', 'none', '2024-10-28 07:00:52.454083', 'completed') ON CONFLICT DO NOTHING;


                                                                                                                       3424.dat                                                                                            0000600 0004000 0002000 00000001170 14710105353 0014244 0                                                                                                    ustar 00postgres                        postgres                        0000000 0000000                                                                                                                                                                        INSERT INTO public.elements (id, element_id, volume, weight) VALUES (1, 'Z3-V4-G-ILP-12', 3.52, 8.80) ON CONFLICT DO NOTHING;
INSERT INTO public.elements (id, element_id, volume, weight) VALUES (2, 'Z3-V4-G-ILP-04', 2.88, 7.20) ON CONFLICT DO NOTHING;
INSERT INTO public.elements (id, element_id, volume, weight) VALUES (4, 'Z3-V4-G-XP-04', 6.35, 15.88) ON CONFLICT DO NOTHING;
INSERT INTO public.elements (id, element_id, volume, weight) VALUES (3, 'Z3-V4-G-XP-09', 7.97, 19.93) ON CONFLICT DO NOTHING;
INSERT INTO public.elements (id, element_id, volume, weight) VALUES (5, 'Z3-V4-G-ILP-05', 0.89, 2.23) ON CONFLICT DO NOTHING;


                                                                                                                                                                                                                                                                                                                                                                                                        3420.dat                                                                                            0000600 0004000 0002000 00000000732 14710105354 0014244 0                                                                                                    ustar 00postgres                        postgres                        0000000 0000000                                                                                                                                                                        INSERT INTO public.jobs (id, job_number, description) VALUES (1, 'ACT.P0102', 'Project 0102') ON CONFLICT DO NOTHING;
INSERT INTO public.jobs (id, job_number, description) VALUES (2, 'ACT.P0103', 'Project 0103') ON CONFLICT DO NOTHING;
INSERT INTO public.jobs (id, job_number, description) VALUES (3, 'ACT.P0104', 'Project 0104') ON CONFLICT DO NOTHING;
INSERT INTO public.jobs (id, job_number, description) VALUES (5, 'ACT.P0305', 'Project 0305') ON CONFLICT DO NOTHING;


                                      3430.dat                                                                                            0000600 0004000 0002000 00000001772 14710105356 0014254 0                                                                                                    ustar 00postgres                        postgres                        0000000 0000000                                                                                                                                                                        INSERT INTO public.planned_castings (id, element_id, planned_volume, planned_date, created_at, planned_amount) VALUES (1, 2, 1.00, '2024-10-26', '2024-10-26 13:36:50.159227', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public.planned_castings (id, element_id, planned_volume, planned_date, created_at, planned_amount) VALUES (2, 3, 0.35, '2024-10-26', '2024-10-26 13:37:32.349499', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public.planned_castings (id, element_id, planned_volume, planned_date, created_at, planned_amount) VALUES (4, 1, 1.50, '2024-10-28', '2024-10-27 13:52:48.084248', 3) ON CONFLICT DO NOTHING;
INSERT INTO public.planned_castings (id, element_id, planned_volume, planned_date, created_at, planned_amount) VALUES (5, 2, 2.00, '2024-10-27', '2024-10-27 14:11:43.702321', 4) ON CONFLICT DO NOTHING;
INSERT INTO public.planned_castings (id, element_id, planned_volume, planned_date, created_at, planned_amount) VALUES (6, 1, 1.50, '2024-10-28', '2024-10-27 18:20:08.009115', 3) ON CONFLICT DO NOTHING;


      3422.dat                                                                                            0000600 0004000 0002000 00000001200 14710105357 0014240 0                                                                                                    ustar 00postgres                        postgres                        0000000 0000000                                                                                                                                                                        INSERT INTO public.tables (id, table_number, description) VALUES (2, 'HALL-1/T-11', 'Hall 1, Table 11') ON CONFLICT DO NOTHING;
INSERT INTO public.tables (id, table_number, description) VALUES (3, 'HALL-2/T-17', 'Hall 2, Table 17') ON CONFLICT DO NOTHING;
INSERT INTO public.tables (id, table_number, description) VALUES (4, 'HALL-2/T-20', 'Hall 2, Table 20') ON CONFLICT DO NOTHING;
INSERT INTO public.tables (id, table_number, description) VALUES (1, 'HALL-1/T-9', 'Hall 1, Table 90') ON CONFLICT DO NOTHING;
INSERT INTO public.tables (id, table_number, description) VALUES (5, 'HALL-3/T-1', 'Hall 4, Table 12') ON CONFLICT DO NOTHING;


                                                                                                                                                                                                                                                                                                                                                                                                3418.dat                                                                                            0000600 0004000 0002000 00000003256 14710105360 0014254 0                                                                                                    ustar 00postgres                        postgres                        0000000 0000000                                                                                                                                                                        INSERT INTO public.users (id, username, password_hash, role, created_at) VALUES (1, 'manager1', 'hashed_password_1', 'manager', '2024-10-21 17:25:41.820983') ON CONFLICT DO NOTHING;
INSERT INTO public.users (id, username, password_hash, role, created_at) VALUES (2, 'employee1', 'hashed_password_2', 'planned_employee', '2024-10-21 17:25:41.820983') ON CONFLICT DO NOTHING;
INSERT INTO public.users (id, username, password_hash, role, created_at) VALUES (3, 'employee2', 'hashed_password_3', 'actual_employee', '2024-10-21 17:25:41.820983') ON CONFLICT DO NOTHING;
INSERT INTO public.users (id, username, password_hash, role, created_at) VALUES (5, 'Me', '$2a$10$0C1c8N54NN1PjA0p5O6dKOEOxcoPdLYjBGIOwiof/d/fhFkw42vki', 'manager', '2024-10-21 19:18:06.901794') ON CONFLICT DO NOTHING;
INSERT INTO public.users (id, username, password_hash, role, created_at) VALUES (6, 'user3', '$2a$10$iQVw/aiMtUYCHuQTpGNFQ.XD3TAmJSNwzERCveDUZ51QT0RoFGkBS', 'planned_employee', '2024-10-23 06:06:11.592258') ON CONFLICT DO NOTHING;
INSERT INTO public.users (id, username, password_hash, role, created_at) VALUES (7, 'user5', '$2a$10$Ld7gOrJa.n5Gmze61Fg22OA4Ndnc2TAjqzOUehIsOQQBg.QubOLpC', 'planned_employee', '2024-10-23 06:39:38.231793') ON CONFLICT DO NOTHING;
INSERT INTO public.users (id, username, password_hash, role, created_at) VALUES (8, 'user9', '$2a$10$WBqHPYDnSrdDHhLYgGhHGOPJaD2JY2Zfaf21ZYkvpX2AFdLJcojDa', 'planned_employee', '2024-10-23 07:09:03.255759') ON CONFLICT DO NOTHING;
INSERT INTO public.users (id, username, password_hash, role, created_at) VALUES (9, 'user10', '$2a$10$2rftppD1DVqdXhiGkGcYFObuiPKwiO8xsLoVXzJKdFsmv58hAqNRe', 'actual_employee', '2024-10-26 17:52:10.402374') ON CONFLICT DO NOTHING;


                                                                                                                                                                                                                                                                                                                                                  restore.sql                                                                                         0000600 0004000 0002000 00000035560 14710105360 0015372 0                                                                                                    ustar 00postgres                        postgres                        0000000 0000000                                                                                                                                                                        --
-- NOTE:
--
-- File paths need to be edited. Search for $$PATH$$ and
-- replace it with the path to the directory containing
-- the extracted data files.
--
--
-- PostgreSQL database dump
--

-- Dumped from database version 16.3 (Debian 16.3-1.pgdg120+1)
-- Dumped by pg_dump version 16.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = on;

DROP DATABASE IF EXISTS ack_db_z975;
--
-- Name: ack_db_z975; Type: DATABASE; Schema: -; Owner: ack_db_z975_user
--

CREATE DATABASE ack_db_z975 WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en_US.UTF8';


ALTER DATABASE ack_db_z975 OWNER TO ack_db_z975_user;

\connect ack_db_z975

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = on;

--
-- Name: ack_db_z975; Type: DATABASE PROPERTIES; Schema: -; Owner: ack_db_z975_user
--

ALTER DATABASE ack_db_z975 SET "TimeZone" TO 'utc';


\connect ack_db_z975

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = on;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: actualcastings; Type: TABLE; Schema: public; Owner: ack_db_z975_user
--

CREATE TABLE public.actualcastings (
    id integer NOT NULL,
    daily_report_id integer NOT NULL,
    casted_amount integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_by integer,
    remarks text,
    casted_volume numeric
);


ALTER TABLE public.actualcastings OWNER TO ack_db_z975_user;

--
-- Name: actualcastings_id_seq; Type: SEQUENCE; Schema: public; Owner: ack_db_z975_user
--

CREATE SEQUENCE public.actualcastings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.actualcastings_id_seq OWNER TO ack_db_z975_user;

--
-- Name: actualcastings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ack_db_z975_user
--

ALTER SEQUENCE public.actualcastings_id_seq OWNED BY public.actualcastings.id;


--
-- Name: dailyreports; Type: TABLE; Schema: public; Owner: ack_db_z975_user
--

CREATE TABLE public.dailyreports (
    id integer NOT NULL,
    date date NOT NULL,
    user_id integer NOT NULL,
    job_id integer NOT NULL,
    table_id integer NOT NULL,
    element_id integer NOT NULL,
    mep text,
    remarks text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    status public.report_status DEFAULT 'pending'::public.report_status
);


ALTER TABLE public.dailyreports OWNER TO ack_db_z975_user;

--
-- Name: dailyreports_id_seq; Type: SEQUENCE; Schema: public; Owner: ack_db_z975_user
--

CREATE SEQUENCE public.dailyreports_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.dailyreports_id_seq OWNER TO ack_db_z975_user;

--
-- Name: dailyreports_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ack_db_z975_user
--

ALTER SEQUENCE public.dailyreports_id_seq OWNED BY public.dailyreports.id;


--
-- Name: elements; Type: TABLE; Schema: public; Owner: ack_db_z975_user
--

CREATE TABLE public.elements (
    id integer NOT NULL,
    element_id character varying(20) NOT NULL,
    volume numeric(10,2) NOT NULL,
    weight numeric(10,2) NOT NULL
);


ALTER TABLE public.elements OWNER TO ack_db_z975_user;

--
-- Name: elements_id_seq; Type: SEQUENCE; Schema: public; Owner: ack_db_z975_user
--

CREATE SEQUENCE public.elements_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.elements_id_seq OWNER TO ack_db_z975_user;

--
-- Name: elements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ack_db_z975_user
--

ALTER SEQUENCE public.elements_id_seq OWNED BY public.elements.id;


--
-- Name: jobs; Type: TABLE; Schema: public; Owner: ack_db_z975_user
--

CREATE TABLE public.jobs (
    id integer NOT NULL,
    job_number character varying(20) NOT NULL,
    description text
);


ALTER TABLE public.jobs OWNER TO ack_db_z975_user;

--
-- Name: jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: ack_db_z975_user
--

CREATE SEQUENCE public.jobs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.jobs_id_seq OWNER TO ack_db_z975_user;

--
-- Name: jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ack_db_z975_user
--

ALTER SEQUENCE public.jobs_id_seq OWNED BY public.jobs.id;


--
-- Name: planned_castings; Type: TABLE; Schema: public; Owner: ack_db_z975_user
--

CREATE TABLE public.planned_castings (
    id integer NOT NULL,
    element_id integer NOT NULL,
    planned_volume numeric(10,2) NOT NULL,
    planned_date date NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    planned_amount integer
);


ALTER TABLE public.planned_castings OWNER TO ack_db_z975_user;

--
-- Name: planned_castings_id_seq; Type: SEQUENCE; Schema: public; Owner: ack_db_z975_user
--

CREATE SEQUENCE public.planned_castings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.planned_castings_id_seq OWNER TO ack_db_z975_user;

--
-- Name: planned_castings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ack_db_z975_user
--

ALTER SEQUENCE public.planned_castings_id_seq OWNED BY public.planned_castings.id;


--
-- Name: tables; Type: TABLE; Schema: public; Owner: ack_db_z975_user
--

CREATE TABLE public.tables (
    id integer NOT NULL,
    table_number character varying(20) NOT NULL,
    description text
);


ALTER TABLE public.tables OWNER TO ack_db_z975_user;

--
-- Name: tables_id_seq; Type: SEQUENCE; Schema: public; Owner: ack_db_z975_user
--

CREATE SEQUENCE public.tables_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tables_id_seq OWNER TO ack_db_z975_user;

--
-- Name: tables_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ack_db_z975_user
--

ALTER SEQUENCE public.tables_id_seq OWNED BY public.tables.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: ack_db_z975_user
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    password_hash character varying(255) NOT NULL,
    role character varying(20) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['manager'::character varying, 'planned_employee'::character varying, 'actual_employee'::character varying])::text[])))
);


ALTER TABLE public.users OWNER TO ack_db_z975_user;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: ack_db_z975_user
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO ack_db_z975_user;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ack_db_z975_user
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: actualcastings id; Type: DEFAULT; Schema: public; Owner: ack_db_z975_user
--

ALTER TABLE ONLY public.actualcastings ALTER COLUMN id SET DEFAULT nextval('public.actualcastings_id_seq'::regclass);


--
-- Name: dailyreports id; Type: DEFAULT; Schema: public; Owner: ack_db_z975_user
--

ALTER TABLE ONLY public.dailyreports ALTER COLUMN id SET DEFAULT nextval('public.dailyreports_id_seq'::regclass);


--
-- Name: elements id; Type: DEFAULT; Schema: public; Owner: ack_db_z975_user
--

ALTER TABLE ONLY public.elements ALTER COLUMN id SET DEFAULT nextval('public.elements_id_seq'::regclass);


--
-- Name: jobs id; Type: DEFAULT; Schema: public; Owner: ack_db_z975_user
--

ALTER TABLE ONLY public.jobs ALTER COLUMN id SET DEFAULT nextval('public.jobs_id_seq'::regclass);


--
-- Name: planned_castings id; Type: DEFAULT; Schema: public; Owner: ack_db_z975_user
--

ALTER TABLE ONLY public.planned_castings ALTER COLUMN id SET DEFAULT nextval('public.planned_castings_id_seq'::regclass);


--
-- Name: tables id; Type: DEFAULT; Schema: public; Owner: ack_db_z975_user
--

ALTER TABLE ONLY public.tables ALTER COLUMN id SET DEFAULT nextval('public.tables_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: ack_db_z975_user
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: actualcastings; Type: TABLE DATA; Schema: public; Owner: ack_db_z975_user
--

\i $$PATH$$/3428.dat

--
-- Data for Name: dailyreports; Type: TABLE DATA; Schema: public; Owner: ack_db_z975_user
--

\i $$PATH$$/3426.dat

--
-- Data for Name: elements; Type: TABLE DATA; Schema: public; Owner: ack_db_z975_user
--

\i $$PATH$$/3424.dat

--
-- Data for Name: jobs; Type: TABLE DATA; Schema: public; Owner: ack_db_z975_user
--

\i $$PATH$$/3420.dat

--
-- Data for Name: planned_castings; Type: TABLE DATA; Schema: public; Owner: ack_db_z975_user
--

\i $$PATH$$/3430.dat

--
-- Data for Name: tables; Type: TABLE DATA; Schema: public; Owner: ack_db_z975_user
--

\i $$PATH$$/3422.dat

--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: ack_db_z975_user
--

\i $$PATH$$/3418.dat

--
-- Name: actualcastings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ack_db_z975_user
--

SELECT pg_catalog.setval('public.actualcastings_id_seq', 5, true);


--
-- Name: dailyreports_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ack_db_z975_user
--

SELECT pg_catalog.setval('public.dailyreports_id_seq', 9, true);


--
-- Name: elements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ack_db_z975_user
--

SELECT pg_catalog.setval('public.elements_id_seq', 7, true);


--
-- Name: jobs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ack_db_z975_user
--

SELECT pg_catalog.setval('public.jobs_id_seq', 5, true);


--
-- Name: planned_castings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ack_db_z975_user
--

SELECT pg_catalog.setval('public.planned_castings_id_seq', 6, true);


--
-- Name: tables_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ack_db_z975_user
--

SELECT pg_catalog.setval('public.tables_id_seq', 5, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ack_db_z975_user
--

SELECT pg_catalog.setval('public.users_id_seq', 9, true);


--
-- Name: actualcastings actualcastings_pkey; Type: CONSTRAINT; Schema: public; Owner: ack_db_z975_user
--

ALTER TABLE ONLY public.actualcastings
    ADD CONSTRAINT actualcastings_pkey PRIMARY KEY (id);


--
-- Name: dailyreports dailyreports_pkey; Type: CONSTRAINT; Schema: public; Owner: ack_db_z975_user
--

ALTER TABLE ONLY public.dailyreports
    ADD CONSTRAINT dailyreports_pkey PRIMARY KEY (id);


--
-- Name: elements elements_element_id_key; Type: CONSTRAINT; Schema: public; Owner: ack_db_z975_user
--

ALTER TABLE ONLY public.elements
    ADD CONSTRAINT elements_element_id_key UNIQUE (element_id);


--
-- Name: elements elements_pkey; Type: CONSTRAINT; Schema: public; Owner: ack_db_z975_user
--

ALTER TABLE ONLY public.elements
    ADD CONSTRAINT elements_pkey PRIMARY KEY (id);


--
-- Name: jobs jobs_job_number_key; Type: CONSTRAINT; Schema: public; Owner: ack_db_z975_user
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_job_number_key UNIQUE (job_number);


--
-- Name: jobs jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: ack_db_z975_user
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_pkey PRIMARY KEY (id);


--
-- Name: planned_castings planned_castings_pkey; Type: CONSTRAINT; Schema: public; Owner: ack_db_z975_user
--

ALTER TABLE ONLY public.planned_castings
    ADD CONSTRAINT planned_castings_pkey PRIMARY KEY (id);


--
-- Name: tables tables_pkey; Type: CONSTRAINT; Schema: public; Owner: ack_db_z975_user
--

ALTER TABLE ONLY public.tables
    ADD CONSTRAINT tables_pkey PRIMARY KEY (id);


--
-- Name: tables tables_table_number_key; Type: CONSTRAINT; Schema: public; Owner: ack_db_z975_user
--

ALTER TABLE ONLY public.tables
    ADD CONSTRAINT tables_table_number_key UNIQUE (table_number);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: ack_db_z975_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: ack_db_z975_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: actualcastings actualcastings_daily_report_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ack_db_z975_user
--

ALTER TABLE ONLY public.actualcastings
    ADD CONSTRAINT actualcastings_daily_report_id_fkey FOREIGN KEY (daily_report_id) REFERENCES public.dailyreports(id);


--
-- Name: actualcastings actualcastings_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ack_db_z975_user
--

ALTER TABLE ONLY public.actualcastings
    ADD CONSTRAINT actualcastings_user_id_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id);


--
-- Name: dailyreports dailyreports_element_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ack_db_z975_user
--

ALTER TABLE ONLY public.dailyreports
    ADD CONSTRAINT dailyreports_element_id_fkey FOREIGN KEY (element_id) REFERENCES public.elements(id);


--
-- Name: dailyreports dailyreports_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ack_db_z975_user
--

ALTER TABLE ONLY public.dailyreports
    ADD CONSTRAINT dailyreports_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id);


--
-- Name: dailyreports dailyreports_table_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ack_db_z975_user
--

ALTER TABLE ONLY public.dailyreports
    ADD CONSTRAINT dailyreports_table_id_fkey FOREIGN KEY (table_id) REFERENCES public.tables(id);


--
-- Name: dailyreports dailyreports_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ack_db_z975_user
--

ALTER TABLE ONLY public.dailyreports
    ADD CONSTRAINT dailyreports_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: planned_castings planned_castings_element_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ack_db_z975_user
--

ALTER TABLE ONLY public.planned_castings
    ADD CONSTRAINT planned_castings_element_id_fkey FOREIGN KEY (element_id) REFERENCES public.elements(id);


--
-- PostgreSQL database dump complete
--

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                