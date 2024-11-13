-- Start transaction
BEGIN;

-- Insert users with correct roles
INSERT INTO public.users (username, password_hash, role) VALUES
('admin', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyBAWjR3Udwx.K', 'manager'),
('supervisor1', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyBAWjR3Udwx.K', 'planned_employee'),
('worker1', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyBAWjR3Udwx.K', 'actual_employee'),
('worker2', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyBAWjR3Udwx.K', 'actual_employee');

-- Insert projects
INSERT INTO public.projects (project_number, name, description, created_by) VALUES
('PRJ-2023-001', 'City Center Development', 'Mixed-use development project in downtown area', 1),
('PRJ-2023-002', 'Harbor Bridge Extension', 'Bridge extension and reinforcement project', 1);

-- Insert jobs
INSERT INTO public.jobs (job_number, description, project_id, created_by) VALUES
('JOB-001-A', 'Foundation Work Phase 1', 1, 1),
('JOB-001-B', 'Column Installation', 1, 1),
('JOB-002-A', 'Bridge Support Structure', 2, 1);

-- Insert tables
INSERT INTO public.tables (table_number, description, project_id, created_by) VALUES
('TBL-001', 'Main Foundation Table', 1, 1),
('TBL-002', 'Column Assembly Table', 1, 1),
('TBL-003', 'Bridge Support Table', 2, 1);

-- Insert elements
INSERT INTO public.elements (element_id, volume, weight, required_amount, project_id) VALUES
('EL-001-F1', 25.5, 61.2, 10, 1),
('EL-001-F2', 30.0, 72.0, 8, 1),
('EL-002-C1', 15.5, 37.2, 12, 1),
('EL-002-B1', 40.0, 96.0, 6, 2);

-- Insert planned castings (from October 2023)
INSERT INTO public.planned_castings (element_id, planned_volume, planned_date, planned_amount) VALUES
(1, 25.5, '2023-10-15', 2),
(1, 25.5, '2023-10-20', 2),
(2, 30.0, '2023-10-25', 2),
(3, 15.5, '2023-11-01', 3),
(4, 40.0, '2023-11-05', 2);

-- Insert daily reports (from October 2023)
INSERT INTO public.dailyreports (date, user_id, job_id, table_id, element_id, mep, status, rft) VALUES
('2023-10-15', 2, 1, 1, 1, 'MEP-001', 'completed', 'RFT-001'),
('2023-10-20', 2, 1, 1, 1, 'MEP-002', 'completed', 'RFT-002'),
('2023-10-25', 2, 1, 1, 2, 'MEP-003', 'completed', 'RFT-003'),
('2023-11-01', 3, 2, 2, 3, 'MEP-004', 'pending', 'RFT-004');

-- Insert actual castings with corrected daily_report_ids
INSERT INTO public.actualcastings (daily_report_id, casted_amount, casted_volume, updated_by, remarks) VALUES
(1, 2, 25.5, 2, 'Completed as planned'),
(2, 2, 25.5, 2, 'Completed as planned'),
(3, 2, 30.0, 2, 'Completed as planned'),
(4, 3, 15.5, 3, 'In progress');

COMMIT;