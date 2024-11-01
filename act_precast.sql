--
-- PostgreSQL database dump
--

-- Dumped from database version 16.3 (Debian 16.3-1.pgdg120+1)
-- Dumped by pg_dump version 16.3

-- Started on 2024-11-01 03:41:58 UTC

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
-- TOC entry 5 (class 2615 OID 2200)
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- *not* creating schema, since initdb creates it


--
-- TOC entry 871 (class 1247 OID 16561)
-- Name: report_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.report_status AS ENUM (
    'pending',
    'in_progress',
    'completed'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 226 (class 1259 OID 16547)
-- Name: actualcastings; Type: TABLE; Schema: public; Owner: -
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


--
-- TOC entry 225 (class 1259 OID 16546)
-- Name: actualcastings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.actualcastings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 3430 (class 0 OID 0)
-- Dependencies: 225
-- Name: actualcastings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.actualcastings_id_seq OWNED BY public.actualcastings.id;


--
-- TOC entry 224 (class 1259 OID 16517)
-- Name: dailyreports; Type: TABLE; Schema: public; Owner: -
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


--
-- TOC entry 223 (class 1259 OID 16516)
-- Name: dailyreports_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.dailyreports_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 3431 (class 0 OID 0)
-- Dependencies: 223
-- Name: dailyreports_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.dailyreports_id_seq OWNED BY public.dailyreports.id;


--
-- TOC entry 222 (class 1259 OID 16508)
-- Name: elements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.elements (
    id integer NOT NULL,
    element_id character varying(20) NOT NULL,
    volume numeric(10,2) NOT NULL,
    weight numeric(10,2) NOT NULL
);


--
-- TOC entry 221 (class 1259 OID 16507)
-- Name: elements_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.elements_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 3432 (class 0 OID 0)
-- Dependencies: 221
-- Name: elements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.elements_id_seq OWNED BY public.elements.id;


--
-- TOC entry 218 (class 1259 OID 16486)
-- Name: jobs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.jobs (
    id integer NOT NULL,
    job_number character varying(20) NOT NULL,
    description text
);


--
-- TOC entry 217 (class 1259 OID 16485)
-- Name: jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.jobs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 3433 (class 0 OID 0)
-- Dependencies: 217
-- Name: jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.jobs_id_seq OWNED BY public.jobs.id;


--
-- TOC entry 228 (class 1259 OID 16585)
-- Name: planned_castings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.planned_castings (
    id integer NOT NULL,
    element_id integer NOT NULL,
    planned_volume numeric(10,2) NOT NULL,
    planned_date date NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    planned_amount integer
);


--
-- TOC entry 227 (class 1259 OID 16584)
-- Name: planned_castings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.planned_castings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 3434 (class 0 OID 0)
-- Dependencies: 227
-- Name: planned_castings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.planned_castings_id_seq OWNED BY public.planned_castings.id;


--
-- TOC entry 220 (class 1259 OID 16497)
-- Name: tables; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tables (
    id integer NOT NULL,
    table_number character varying(20) NOT NULL,
    description text
);


--
-- TOC entry 219 (class 1259 OID 16496)
-- Name: tables_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.tables_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 3435 (class 0 OID 0)
-- Dependencies: 219
-- Name: tables_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.tables_id_seq OWNED BY public.tables.id;


--
-- TOC entry 216 (class 1259 OID 16475)
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    password_hash character varying(255) NOT NULL,
    role character varying(20) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['manager'::character varying, 'planned_employee'::character varying, 'actual_employee'::character varying])::text[])))
);


--
-- TOC entry 215 (class 1259 OID 16474)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 3436 (class 0 OID 0)
-- Dependencies: 215
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 3248 (class 2604 OID 16550)
-- Name: actualcastings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.actualcastings ALTER COLUMN id SET DEFAULT nextval('public.actualcastings_id_seq'::regclass);


--
-- TOC entry 3245 (class 2604 OID 16520)
-- Name: dailyreports id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dailyreports ALTER COLUMN id SET DEFAULT nextval('public.dailyreports_id_seq'::regclass);


--
-- TOC entry 3244 (class 2604 OID 16511)
-- Name: elements id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.elements ALTER COLUMN id SET DEFAULT nextval('public.elements_id_seq'::regclass);


--
-- TOC entry 3242 (class 2604 OID 16489)
-- Name: jobs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jobs ALTER COLUMN id SET DEFAULT nextval('public.jobs_id_seq'::regclass);


--
-- TOC entry 3250 (class 2604 OID 16588)
-- Name: planned_castings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.planned_castings ALTER COLUMN id SET DEFAULT nextval('public.planned_castings_id_seq'::regclass);


--
-- TOC entry 3243 (class 2604 OID 16500)
-- Name: tables id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tables ALTER COLUMN id SET DEFAULT nextval('public.tables_id_seq'::regclass);


--
-- TOC entry 3240 (class 2604 OID 16478)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 3272 (class 2606 OID 16553)
-- Name: actualcastings actualcastings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.actualcastings
    ADD CONSTRAINT actualcastings_pkey PRIMARY KEY (id);


--
-- TOC entry 3270 (class 2606 OID 16525)
-- Name: dailyreports dailyreports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dailyreports
    ADD CONSTRAINT dailyreports_pkey PRIMARY KEY (id);


--
-- TOC entry 3266 (class 2606 OID 16515)
-- Name: elements elements_element_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.elements
    ADD CONSTRAINT elements_element_id_key UNIQUE (element_id);


--
-- TOC entry 3268 (class 2606 OID 16513)
-- Name: elements elements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.elements
    ADD CONSTRAINT elements_pkey PRIMARY KEY (id);


--
-- TOC entry 3258 (class 2606 OID 16495)
-- Name: jobs jobs_job_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_job_number_key UNIQUE (job_number);


--
-- TOC entry 3260 (class 2606 OID 16493)
-- Name: jobs jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_pkey PRIMARY KEY (id);


--
-- TOC entry 3274 (class 2606 OID 16591)
-- Name: planned_castings planned_castings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.planned_castings
    ADD CONSTRAINT planned_castings_pkey PRIMARY KEY (id);


--
-- TOC entry 3262 (class 2606 OID 16504)
-- Name: tables tables_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tables
    ADD CONSTRAINT tables_pkey PRIMARY KEY (id);


--
-- TOC entry 3264 (class 2606 OID 16506)
-- Name: tables tables_table_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tables
    ADD CONSTRAINT tables_table_number_key UNIQUE (table_number);


--
-- TOC entry 3254 (class 2606 OID 16482)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 3256 (class 2606 OID 16484)
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- TOC entry 3279 (class 2606 OID 16554)
-- Name: actualcastings actualcastings_daily_report_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.actualcastings
    ADD CONSTRAINT actualcastings_daily_report_id_fkey FOREIGN KEY (daily_report_id) REFERENCES public.dailyreports(id);


--
-- TOC entry 3280 (class 2606 OID 16602)
-- Name: actualcastings actualcastings_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.actualcastings
    ADD CONSTRAINT actualcastings_user_id_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id);


--
-- TOC entry 3275 (class 2606 OID 16541)
-- Name: dailyreports dailyreports_element_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dailyreports
    ADD CONSTRAINT dailyreports_element_id_fkey FOREIGN KEY (element_id) REFERENCES public.elements(id);


--
-- TOC entry 3276 (class 2606 OID 16531)
-- Name: dailyreports dailyreports_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dailyreports
    ADD CONSTRAINT dailyreports_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id);


--
-- TOC entry 3277 (class 2606 OID 16536)
-- Name: dailyreports dailyreports_table_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dailyreports
    ADD CONSTRAINT dailyreports_table_id_fkey FOREIGN KEY (table_id) REFERENCES public.tables(id);


--
-- TOC entry 3278 (class 2606 OID 16526)
-- Name: dailyreports dailyreports_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dailyreports
    ADD CONSTRAINT dailyreports_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 3281 (class 2606 OID 16592)
-- Name: planned_castings planned_castings_element_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.planned_castings
    ADD CONSTRAINT planned_castings_element_id_fkey FOREIGN KEY (element_id) REFERENCES public.elements(id);


-- Completed on 2024-11-01 03:42:23 UTC

--
-- PostgreSQL database dump complete
--

