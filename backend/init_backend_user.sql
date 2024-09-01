insert into app_user (id, create_date, email, "password", first_name, surname, is_using_2FA)
values (nextval('homeworkmole_seq'), now(), 'support.rebeka@pmi.co.hu',
        '{bcrypt}$2a$10$rPXKOebWQUDA/Hm.db2hreKDDMsC5jjsOmPNmvixIcTUrCuzROjVm', 'Rebeka', 'Support', false
       );

INSERT INTO public.app_user_role(app_user_id, role_id) VALUES ((SELECT id FROM app_user WHERE email = 'support.rebeka@pmi.co.hu'), (SELECT id FROM "role" WHERE name = 'USER'));

INSERT INTO public.app_user_role(app_user_id, role_id) VALUES ((SELECT id FROM app_user WHERE email = 'support.rebeka@pmi.co.hu'), (SELECT id FROM "role" WHERE name = 'SUPER_USER'));

INSERT INTO public.app_user_role(app_user_id, role_id) VALUES ((SELECT id FROM app_user WHERE email = 'support.rebeka@pmi.co.hu'), (SELECT id FROM "role" WHERE name = 'ADMINISTRATOR'));
