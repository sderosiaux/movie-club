insert into cinemas (name, slug, borough, neighborhood, website_url) values
  ('Nitehawk Cinema Williamsburg', 'nitehawk-williamsburg', 'Brooklyn', 'Williamsburg', 'https://nitehawkcinema.com'),
  ('Nitehawk Cinema Prospect Park', 'nitehawk-prospect-park', 'Brooklyn', 'Park Slope', 'https://nitehawkcinema.com'),
  ('BAM Rose Cinemas', 'bam-rose', 'Brooklyn', 'Fort Greene', 'https://www.bam.org'),
  ('Alamo Drafthouse Brooklyn', 'alamo-brooklyn', 'Brooklyn', 'Downtown Brooklyn', 'https://drafthouse.com'),
  ('Syndicated', 'syndicated', 'Brooklyn', 'Bushwick', 'https://syndicatedbk.com'),
  ('Regal UA Court Street', 'regal-court-street', 'Brooklyn', 'Cobble Hill', 'https://www.regmovies.com'),
  ('Angelika Film Center', 'angelika', 'Manhattan', 'NoHo', 'https://angelikafilmcenter.com'),
  ('IFC Center', 'ifc-center', 'Manhattan', 'Greenwich Village', 'https://www.ifccenter.com'),
  ('Film Forum', 'film-forum', 'Manhattan', 'West Village', 'https://filmforum.org'),
  ('Metrograph', 'metrograph', 'Manhattan', 'Lower East Side', 'https://metrograph.com'),
  ('AMC Lincoln Square', 'amc-lincoln-square', 'Manhattan', 'Upper West Side', 'https://www.amctheatres.com'),
  ('Regal Essex Crossing', 'regal-essex', 'Manhattan', 'Lower East Side', 'https://www.regmovies.com'),
  ('Village East by Angelika', 'village-east', 'Manhattan', 'East Village', 'https://angelikafilmcenter.com'),
  ('Museum of the Moving Image', 'momi', 'Queens', 'Astoria', 'https://movingimage.us')
on conflict (slug) do nothing;
