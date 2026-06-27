insert into students (standard, division, roll_number, full_name) values
  ('Std 10', 'A', 1, 'Demo Student One'),
  ('Std 10', 'A', 2, 'Demo Student Two'),
  ('Std 9', 'B', 1, 'Demo Student Three'),
  ('Std 11 Science', 'A', 1, 'Demo Science Student'),
  ('Std 11 Commerce', 'A', 1, 'Demo Commerce Student'),
  ('Std 12 Science', 'A', 1, 'Demo Senior Science Student'),
  ('Std 12 Commerce', 'A', 1, 'Demo Senior Commerce Student')
on conflict (standard, division, roll_number) do nothing;

insert into candidates (position_id, name, standard, division, manifesto)
select id, 'Demo Candidate for ' || title, 'Std 10', 'A', 'Responsible leadership for every student.'
from positions
on conflict do nothing;
