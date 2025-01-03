PGDMP  $                
    |            ack_db_z975    16.3 (Debian 16.3-1.pgdg120+1)    16.3 J    �           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                      false            �           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                      false            �           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                      false            �           1262    16389    ack_db_z975    DATABASE     v   CREATE DATABASE ack_db_z975 WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en_US.UTF8';
    DROP DATABASE ack_db_z975;
                ack_db_z975_user    false            �           0    0    ack_db_z975    DATABASE PROPERTIES     4   ALTER DATABASE ack_db_z975 SET "TimeZone" TO 'utc';
                     ack_db_z975_user    false                        2615    2200    public    SCHEMA     2   -- *not* creating schema, since initdb creates it
 2   -- *not* dropping schema, since initdb creates it
                ack_db_z975_user    false            i           1247    16561    report_status    TYPE     `   CREATE TYPE public.report_status AS ENUM (
    'pending',
    'in_progress',
    'completed'
);
     DROP TYPE public.report_status;
       public          ack_db_z975_user    false    5            �            1259    16547    actualcastings    TABLE       CREATE TABLE public.actualcastings (
    id integer NOT NULL,
    daily_report_id integer NOT NULL,
    casted_amount integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_by integer,
    remarks text,
    casted_volume numeric
);
 "   DROP TABLE public.actualcastings;
       public         heap    ack_db_z975_user    false    5            �            1259    16546    actualcastings_id_seq    SEQUENCE     �   CREATE SEQUENCE public.actualcastings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 ,   DROP SEQUENCE public.actualcastings_id_seq;
       public          ack_db_z975_user    false    226    5            �           0    0    actualcastings_id_seq    SEQUENCE OWNED BY     O   ALTER SEQUENCE public.actualcastings_id_seq OWNED BY public.actualcastings.id;
          public          ack_db_z975_user    false    225            �            1259    16517    dailyreports    TABLE     �  CREATE TABLE public.dailyreports (
    id integer NOT NULL,
    date date NOT NULL,
    user_id integer NOT NULL,
    job_id integer NOT NULL,
    table_id integer NOT NULL,
    element_id integer NOT NULL,
    mep text,
    remarks text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    status public.report_status DEFAULT 'pending'::public.report_status,
    rft character varying(20)
);
     DROP TABLE public.dailyreports;
       public         heap    ack_db_z975_user    false    873    873    5            �            1259    16516    dailyreports_id_seq    SEQUENCE     �   CREATE SEQUENCE public.dailyreports_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 *   DROP SEQUENCE public.dailyreports_id_seq;
       public          ack_db_z975_user    false    224    5            �           0    0    dailyreports_id_seq    SEQUENCE OWNED BY     K   ALTER SEQUENCE public.dailyreports_id_seq OWNED BY public.dailyreports.id;
          public          ack_db_z975_user    false    223            �            1259    16508    elements    TABLE     �  CREATE TABLE public.elements (
    id integer NOT NULL,
    element_id character varying(20) NOT NULL,
    volume numeric(10,2) NOT NULL,
    weight numeric(10,2) NOT NULL,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    deleted_at timestamp without time zone,
    deleted_by integer,
    required_amount integer NOT NULL,
    project_id integer
);
    DROP TABLE public.elements;
       public         heap    ack_db_z975_user    false    5            �            1259    16507    elements_id_seq    SEQUENCE     �   CREATE SEQUENCE public.elements_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 &   DROP SEQUENCE public.elements_id_seq;
       public          ack_db_z975_user    false    5    222            �           0    0    elements_id_seq    SEQUENCE OWNED BY     C   ALTER SEQUENCE public.elements_id_seq OWNED BY public.elements.id;
          public          ack_db_z975_user    false    221            �            1259    16486    jobs    TABLE     {  CREATE TABLE public.jobs (
    id integer NOT NULL,
    job_number character varying(20) NOT NULL,
    description text,
    project_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_by integer,
    updated_at timestamp without time zone,
    updated_by integer,
    status character varying(20) DEFAULT 'active'::character varying
);
    DROP TABLE public.jobs;
       public         heap    ack_db_z975_user    false    5            �            1259    16485    jobs_id_seq    SEQUENCE     �   CREATE SEQUENCE public.jobs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 "   DROP SEQUENCE public.jobs_id_seq;
       public          ack_db_z975_user    false    218    5            �           0    0    jobs_id_seq    SEQUENCE OWNED BY     ;   ALTER SEQUENCE public.jobs_id_seq OWNED BY public.jobs.id;
          public          ack_db_z975_user    false    217            �            1259    16585    planned_castings    TABLE       CREATE TABLE public.planned_castings (
    id integer NOT NULL,
    element_id integer NOT NULL,
    planned_volume numeric(10,2) NOT NULL,
    planned_date date NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    planned_amount integer
);
 $   DROP TABLE public.planned_castings;
       public         heap    ack_db_z975_user    false    5            �            1259    16584    planned_castings_id_seq    SEQUENCE     �   CREATE SEQUENCE public.planned_castings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 .   DROP SEQUENCE public.planned_castings_id_seq;
       public          ack_db_z975_user    false    5    228            �           0    0    planned_castings_id_seq    SEQUENCE OWNED BY     S   ALTER SEQUENCE public.planned_castings_id_seq OWNED BY public.planned_castings.id;
          public          ack_db_z975_user    false    227            �            1259    16726    projects    TABLE     �  CREATE TABLE public.projects (
    id integer NOT NULL,
    project_number character varying(20) NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_by integer,
    updated_at timestamp without time zone,
    updated_by integer
);
    DROP TABLE public.projects;
       public         heap    ack_db_z975_user    false    5            �            1259    16725    projects_id_seq    SEQUENCE     �   CREATE SEQUENCE public.projects_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 &   DROP SEQUENCE public.projects_id_seq;
       public          ack_db_z975_user    false    230    5            �           0    0    projects_id_seq    SEQUENCE OWNED BY     C   ALTER SEQUENCE public.projects_id_seq OWNED BY public.projects.id;
          public          ack_db_z975_user    false    229            �            1259    16497    tables    TABLE       CREATE TABLE public.tables (
    id integer NOT NULL,
    table_number character varying(20) NOT NULL,
    description text,
    project_id integer,
    status character varying(20) DEFAULT 'active'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_by integer,
    updated_at timestamp without time zone,
    updated_by integer
);
    DROP TABLE public.tables;
       public         heap    ack_db_z975_user    false    5            �            1259    16496    tables_id_seq    SEQUENCE     �   CREATE SEQUENCE public.tables_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 $   DROP SEQUENCE public.tables_id_seq;
       public          ack_db_z975_user    false    220    5            �           0    0    tables_id_seq    SEQUENCE OWNED BY     ?   ALTER SEQUENCE public.tables_id_seq OWNED BY public.tables.id;
          public          ack_db_z975_user    false    219            �            1259    16475    users    TABLE     �  CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    password_hash character varying(255) NOT NULL,
    role character varying(20) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['manager'::character varying, 'planned_employee'::character varying, 'actual_employee'::character varying])::text[])))
);
    DROP TABLE public.users;
       public         heap    ack_db_z975_user    false    5            �            1259    16474    users_id_seq    SEQUENCE     �   CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 #   DROP SEQUENCE public.users_id_seq;
       public          ack_db_z975_user    false    216    5            �           0    0    users_id_seq    SEQUENCE OWNED BY     =   ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;
          public          ack_db_z975_user    false    215            �           2604    16550    actualcastings id    DEFAULT     v   ALTER TABLE ONLY public.actualcastings ALTER COLUMN id SET DEFAULT nextval('public.actualcastings_id_seq'::regclass);
 @   ALTER TABLE public.actualcastings ALTER COLUMN id DROP DEFAULT;
       public          ack_db_z975_user    false    226    225    226            �           2604    16520    dailyreports id    DEFAULT     r   ALTER TABLE ONLY public.dailyreports ALTER COLUMN id SET DEFAULT nextval('public.dailyreports_id_seq'::regclass);
 >   ALTER TABLE public.dailyreports ALTER COLUMN id DROP DEFAULT;
       public          ack_db_z975_user    false    223    224    224            �           2604    16511    elements id    DEFAULT     j   ALTER TABLE ONLY public.elements ALTER COLUMN id SET DEFAULT nextval('public.elements_id_seq'::regclass);
 :   ALTER TABLE public.elements ALTER COLUMN id DROP DEFAULT;
       public          ack_db_z975_user    false    221    222    222            �           2604    16489    jobs id    DEFAULT     b   ALTER TABLE ONLY public.jobs ALTER COLUMN id SET DEFAULT nextval('public.jobs_id_seq'::regclass);
 6   ALTER TABLE public.jobs ALTER COLUMN id DROP DEFAULT;
       public          ack_db_z975_user    false    217    218    218            �           2604    16588    planned_castings id    DEFAULT     z   ALTER TABLE ONLY public.planned_castings ALTER COLUMN id SET DEFAULT nextval('public.planned_castings_id_seq'::regclass);
 B   ALTER TABLE public.planned_castings ALTER COLUMN id DROP DEFAULT;
       public          ack_db_z975_user    false    227    228    228            �           2604    16729    projects id    DEFAULT     j   ALTER TABLE ONLY public.projects ALTER COLUMN id SET DEFAULT nextval('public.projects_id_seq'::regclass);
 :   ALTER TABLE public.projects ALTER COLUMN id DROP DEFAULT;
       public          ack_db_z975_user    false    230    229    230            �           2604    16500 	   tables id    DEFAULT     f   ALTER TABLE ONLY public.tables ALTER COLUMN id SET DEFAULT nextval('public.tables_id_seq'::regclass);
 8   ALTER TABLE public.tables ALTER COLUMN id DROP DEFAULT;
       public          ack_db_z975_user    false    220    219    220            �           2604    16478    users id    DEFAULT     d   ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);
 7   ALTER TABLE public.users ALTER COLUMN id DROP DEFAULT;
       public          ack_db_z975_user    false    216    215    216            �           2606    16553 "   actualcastings actualcastings_pkey 
   CONSTRAINT     `   ALTER TABLE ONLY public.actualcastings
    ADD CONSTRAINT actualcastings_pkey PRIMARY KEY (id);
 L   ALTER TABLE ONLY public.actualcastings DROP CONSTRAINT actualcastings_pkey;
       public            ack_db_z975_user    false    226            �           2606    16525    dailyreports dailyreports_pkey 
   CONSTRAINT     \   ALTER TABLE ONLY public.dailyreports
    ADD CONSTRAINT dailyreports_pkey PRIMARY KEY (id);
 H   ALTER TABLE ONLY public.dailyreports DROP CONSTRAINT dailyreports_pkey;
       public            ack_db_z975_user    false    224            �           2606    16515     elements elements_element_id_key 
   CONSTRAINT     a   ALTER TABLE ONLY public.elements
    ADD CONSTRAINT elements_element_id_key UNIQUE (element_id);
 J   ALTER TABLE ONLY public.elements DROP CONSTRAINT elements_element_id_key;
       public            ack_db_z975_user    false    222            �           2606    16513    elements elements_pkey 
   CONSTRAINT     T   ALTER TABLE ONLY public.elements
    ADD CONSTRAINT elements_pkey PRIMARY KEY (id);
 @   ALTER TABLE ONLY public.elements DROP CONSTRAINT elements_pkey;
       public            ack_db_z975_user    false    222            �           2606    16495    jobs jobs_job_number_key 
   CONSTRAINT     Y   ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_job_number_key UNIQUE (job_number);
 B   ALTER TABLE ONLY public.jobs DROP CONSTRAINT jobs_job_number_key;
       public            ack_db_z975_user    false    218            �           2606    16493    jobs jobs_pkey 
   CONSTRAINT     L   ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_pkey PRIMARY KEY (id);
 8   ALTER TABLE ONLY public.jobs DROP CONSTRAINT jobs_pkey;
       public            ack_db_z975_user    false    218            �           2606    16591 &   planned_castings planned_castings_pkey 
   CONSTRAINT     d   ALTER TABLE ONLY public.planned_castings
    ADD CONSTRAINT planned_castings_pkey PRIMARY KEY (id);
 P   ALTER TABLE ONLY public.planned_castings DROP CONSTRAINT planned_castings_pkey;
       public            ack_db_z975_user    false    228            �           2606    16735    projects projects_pkey 
   CONSTRAINT     T   ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);
 @   ALTER TABLE ONLY public.projects DROP CONSTRAINT projects_pkey;
       public            ack_db_z975_user    false    230            �           2606    16737 $   projects projects_project_number_key 
   CONSTRAINT     i   ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_project_number_key UNIQUE (project_number);
 N   ALTER TABLE ONLY public.projects DROP CONSTRAINT projects_project_number_key;
       public            ack_db_z975_user    false    230            �           2606    16504    tables tables_pkey 
   CONSTRAINT     P   ALTER TABLE ONLY public.tables
    ADD CONSTRAINT tables_pkey PRIMARY KEY (id);
 <   ALTER TABLE ONLY public.tables DROP CONSTRAINT tables_pkey;
       public            ack_db_z975_user    false    220            �           2606    16506    tables tables_table_number_key 
   CONSTRAINT     a   ALTER TABLE ONLY public.tables
    ADD CONSTRAINT tables_table_number_key UNIQUE (table_number);
 H   ALTER TABLE ONLY public.tables DROP CONSTRAINT tables_table_number_key;
       public            ack_db_z975_user    false    220            �           2606    16482    users users_pkey 
   CONSTRAINT     N   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);
 :   ALTER TABLE ONLY public.users DROP CONSTRAINT users_pkey;
       public            ack_db_z975_user    false    216            �           2606    16484    users users_username_key 
   CONSTRAINT     W   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);
 B   ALTER TABLE ONLY public.users DROP CONSTRAINT users_username_key;
       public            ack_db_z975_user    false    216            �           1259    16785    idx_elements_project_id    INDEX     R   CREATE INDEX idx_elements_project_id ON public.elements USING btree (project_id);
 +   DROP INDEX public.idx_elements_project_id;
       public            ack_db_z975_user    false    222            �           1259    16616    idx_elements_status    INDEX     J   CREATE INDEX idx_elements_status ON public.elements USING btree (status);
 '   DROP INDEX public.idx_elements_status;
       public            ack_db_z975_user    false    222            �           1259    16781    idx_jobs_project_id    INDEX     J   CREATE INDEX idx_jobs_project_id ON public.jobs USING btree (project_id);
 '   DROP INDEX public.idx_jobs_project_id;
       public            ack_db_z975_user    false    218            �           1259    16782    idx_jobs_status    INDEX     B   CREATE INDEX idx_jobs_status ON public.jobs USING btree (status);
 #   DROP INDEX public.idx_jobs_status;
       public            ack_db_z975_user    false    218            �           1259    16780    idx_projects_status    INDEX     J   CREATE INDEX idx_projects_status ON public.projects USING btree (status);
 '   DROP INDEX public.idx_projects_status;
       public            ack_db_z975_user    false    230            �           1259    16783    idx_tables_project_id    INDEX     N   CREATE INDEX idx_tables_project_id ON public.tables USING btree (project_id);
 )   DROP INDEX public.idx_tables_project_id;
       public            ack_db_z975_user    false    220            �           1259    16784    idx_tables_status    INDEX     F   CREATE INDEX idx_tables_status ON public.tables USING btree (status);
 %   DROP INDEX public.idx_tables_status;
       public            ack_db_z975_user    false    220            �           2606    16554 2   actualcastings actualcastings_daily_report_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.actualcastings
    ADD CONSTRAINT actualcastings_daily_report_id_fkey FOREIGN KEY (daily_report_id) REFERENCES public.dailyreports(id);
 \   ALTER TABLE ONLY public.actualcastings DROP CONSTRAINT actualcastings_daily_report_id_fkey;
       public          ack_db_z975_user    false    226    3289    224            �           2606    16602 *   actualcastings actualcastings_user_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.actualcastings
    ADD CONSTRAINT actualcastings_user_id_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id);
 T   ALTER TABLE ONLY public.actualcastings DROP CONSTRAINT actualcastings_user_id_fkey;
       public          ack_db_z975_user    false    216    3267    226            �           2606    16541 )   dailyreports dailyreports_element_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.dailyreports
    ADD CONSTRAINT dailyreports_element_id_fkey FOREIGN KEY (element_id) REFERENCES public.elements(id);
 S   ALTER TABLE ONLY public.dailyreports DROP CONSTRAINT dailyreports_element_id_fkey;
       public          ack_db_z975_user    false    3285    224    222            �           2606    16531 %   dailyreports dailyreports_job_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.dailyreports
    ADD CONSTRAINT dailyreports_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id);
 O   ALTER TABLE ONLY public.dailyreports DROP CONSTRAINT dailyreports_job_id_fkey;
       public          ack_db_z975_user    false    3275    218    224            �           2606    16536 '   dailyreports dailyreports_table_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.dailyreports
    ADD CONSTRAINT dailyreports_table_id_fkey FOREIGN KEY (table_id) REFERENCES public.tables(id);
 Q   ALTER TABLE ONLY public.dailyreports DROP CONSTRAINT dailyreports_table_id_fkey;
       public          ack_db_z975_user    false    224    220    3279            �           2606    16526 &   dailyreports dailyreports_user_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.dailyreports
    ADD CONSTRAINT dailyreports_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);
 P   ALTER TABLE ONLY public.dailyreports DROP CONSTRAINT dailyreports_user_id_fkey;
       public          ack_db_z975_user    false    224    3267    216            �           2606    16617 !   elements elements_deleted_by_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.elements
    ADD CONSTRAINT elements_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.users(id);
 K   ALTER TABLE ONLY public.elements DROP CONSTRAINT elements_deleted_by_fkey;
       public          ack_db_z975_user    false    222    3267    216            �           2606    16758 !   elements elements_project_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.elements
    ADD CONSTRAINT elements_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE RESTRICT;
 K   ALTER TABLE ONLY public.elements DROP CONSTRAINT elements_project_id_fkey;
       public          ack_db_z975_user    false    222    3296    230            �           2606    16765    jobs jobs_created_by_fkey    FK CONSTRAINT     {   ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);
 C   ALTER TABLE ONLY public.jobs DROP CONSTRAINT jobs_created_by_fkey;
       public          ack_db_z975_user    false    218    216    3267            �           2606    16748    jobs jobs_project_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE RESTRICT;
 C   ALTER TABLE ONLY public.jobs DROP CONSTRAINT jobs_project_id_fkey;
       public          ack_db_z975_user    false    3296    230    218            �           2606    16770    jobs jobs_updated_by_fkey    FK CONSTRAINT     {   ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id);
 C   ALTER TABLE ONLY public.jobs DROP CONSTRAINT jobs_updated_by_fkey;
       public          ack_db_z975_user    false    218    3267    216            �           2606    16592 1   planned_castings planned_castings_element_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.planned_castings
    ADD CONSTRAINT planned_castings_element_id_fkey FOREIGN KEY (element_id) REFERENCES public.elements(id);
 [   ALTER TABLE ONLY public.planned_castings DROP CONSTRAINT planned_castings_element_id_fkey;
       public          ack_db_z975_user    false    222    3285    228            �           2606    16738 !   projects projects_created_by_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);
 K   ALTER TABLE ONLY public.projects DROP CONSTRAINT projects_created_by_fkey;
       public          ack_db_z975_user    false    216    3267    230            �           2606    16743 !   projects projects_updated_by_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id);
 K   ALTER TABLE ONLY public.projects DROP CONSTRAINT projects_updated_by_fkey;
       public          ack_db_z975_user    false    3267    216    230            �           2606    16753    tables tables_project_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.tables
    ADD CONSTRAINT tables_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE RESTRICT;
 G   ALTER TABLE ONLY public.tables DROP CONSTRAINT tables_project_id_fkey;
       public          ack_db_z975_user    false    3296    230    220           