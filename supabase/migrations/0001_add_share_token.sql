-- Enable only passengers of that ride to call the function
alter table rides enable row level security;

create policy "Passengers can update own ride token"
on rides for update
using (auth.uid() = passenger_id);

-- Public RLS view for read-only tracking
create view ride_public as
select id,
       driver_name,
       vehicle_plate,
       pickup_address,
       dropoff_address,
       eta,
       position_lat,
       position_lng,
       share_token
from rides
where status = 'in_progress'
  and share_token is not null;

alter view ride_public enable row level security;
create policy "Anyone with token can select"
on ride_public for select
using ( true );
