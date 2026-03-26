-- Detect potential crew candidates based on shared screening attendance
create or replace function detect_crew_candidates(
  target_user_id uuid,
  min_shared_screenings int default 3
)
returns table (
  profile_id uuid,
  name text,
  photo_url text,
  shared_screenings bigint,
  mutual_would_go_again boolean
)
language sql stable as $$
  select
    p.id as profile_id,
    p.name,
    p.photo_url,
    count(distinct sa2.screening_id) as shared_screenings,
    exists (
      select 1 from would_go_again w1
      join would_go_again w2
        on w1.to_user_id = w2.from_user_id
        and w1.from_user_id = w2.to_user_id
      where w1.from_user_id = target_user_id
        and w1.to_user_id = p.id
    ) as mutual_would_go_again
  from screening_attendees sa1
  join screening_attendees sa2
    on sa1.screening_id = sa2.screening_id
    and sa1.profile_id != sa2.profile_id
  join profiles p on p.id = sa2.profile_id
  where sa1.profile_id = target_user_id
    and sa1.status = 'confirmed'
    and sa2.status = 'confirmed'
  group by p.id, p.name, p.photo_url
  having count(distinct sa2.screening_id) >= min_shared_screenings
  order by count(distinct sa2.screening_id) desc;
$$;

-- Create a crew with members (bypasses RLS so organizer can add other members)
create or replace function create_crew_with_members(
  crew_name text,
  member_ids uuid[]
)
returns uuid
language plpgsql security definer as $$
declare
  new_crew_id uuid;
  i int;
begin
  -- Verify the caller is authenticated
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  -- Ensure caller is in the member list
  if not (auth.uid() = any(member_ids)) then
    member_ids := array_prepend(auth.uid(), member_ids);
  end if;

  -- Create crew
  insert into crews (name) values (crew_name) returning id into new_crew_id;

  -- Add all members with turn order
  for i in 1..array_length(member_ids, 1) loop
    insert into crew_members (crew_id, profile_id, turn_order)
    values (new_crew_id, member_ids[i], i - 1);
  end loop;

  return new_crew_id;
end;
$$;
