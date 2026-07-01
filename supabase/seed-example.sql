insert into students (standard, division, roll_number, full_name) values
  ('Std 10', 'A', 1, 'Demo Student One'),
  ('Std 10', 'A', 2, 'Demo Student Two'),
  ('Std 9', 'B', 1, 'Demo Student Three'),
  ('Std 11 Science', 'A', 1, 'Demo Science Student'),
  ('Std 11 Commerce', 'A', 1, 'Demo Commerce Student'),
  ('Std 12 Science', 'A', 1, 'Demo Senior Science Student'),
  ('Std 12 Commerce', 'A', 1, 'Demo Senior Commerce Student')
on conflict (standard, division, roll_number) do nothing;

with selected_candidates(position_title, name, standard) as (
  values
    ('Head Boy', 'Malek Ayaan', 'Std 11'),
    ('Head Boy', 'Arab Zenul', 'Std 11'),
    ('Head Boy', 'Karbhari Aman', 'Std 11'),
    ('Head Girl', 'Shaikh Aksa', 'Std 11'),
    ('Head Girl', 'Shaikh Ayesha', 'Std 11'),
    ('Vice Head Boy', 'Shaikh Vakid', 'Std 9'),
    ('Vice Head Boy', 'Gabanwala Alkama', 'Std 9'),
    ('Vice Head Girl', 'Pathan Tahura', 'Std 9'),
    ('Vice Head Girl', 'Shaikh Aksa', 'Std 9'),
    ('Junior Head Boy', 'Shaikh Atif', 'Std 8'),
    ('Junior Head Boy', 'Karbhari Rehan', 'Std 6'),
    ('Junior Head Boy', 'Shaikh Mohd Avesh', 'Std 6'),
    ('Junior Head Boy', 'Kauvawala Musab', 'Std 6'),
    ('Junior Head Girl', 'Shaikh Ayana', 'Std 6'),
    ('Junior Head Girl', 'Vohra Safrin', 'Std 6'),
    ('Cultural Head (Boy)', 'Patanwala Taha', 'Std 9'),
    ('Cultural Head (Girl)', 'Pathan Roshni Fatema', 'Std 11'),
    ('Discipline Head (Boy)', 'Malek Arman', 'Std 9'),
    ('Discipline Head (Boy)', 'Karbhari Arhan', 'Std 9'),
    ('Discipline Head (Boy)', 'Sethwala Hamdan', 'Std 6'),
    ('Discipline Head (Girl)', 'Pathan Rehnuma', 'Std 9'),
    ('Discipline Head (Girl)', 'Shaikh Fatema', 'Std 7'),
    ('Discipline Head (Girl)', 'Shaikh Humaisa', 'Std 7'),
    ('Sports Captain (Boy)', 'Kheruwala Hamza', 'Std 11'),
    ('Sports Captain (Boy)', 'Vohra Mo. Zaid', 'Std 11'),
    ('Sports Captain (Boy)', 'Shaikh Mo. Amis Aslam', 'Std 11'),
    ('Sports Captain (Girl)', 'Maurya Sejal', 'Std 11'),
    ('Sports Captain (Girl)', 'Shaikh Aksha', 'Std 9')
)
insert into candidates (position_id, name, standard, division, manifesto, is_active)
select p.id, sc.name, sc.standard, null, 'Candidate for ' || sc.position_title || '.', true
from selected_candidates sc
join positions p on p.title = sc.position_title
where not exists (
  select 1
  from candidates c
  where c.position_id = p.id
    and c.name = sc.name
    and c.standard = sc.standard
);
