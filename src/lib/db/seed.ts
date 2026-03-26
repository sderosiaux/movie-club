import { db } from "./index";
import { cinemas } from "./schema";

const cinemaData = [
  { name: "Nitehawk Cinema Williamsburg", slug: "nitehawk-williamsburg", borough: "Brooklyn" as const, neighborhood: "Williamsburg", websiteUrl: "https://nitehawkcinema.com" },
  { name: "Nitehawk Cinema Prospect Park", slug: "nitehawk-prospect-park", borough: "Brooklyn" as const, neighborhood: "Park Slope", websiteUrl: "https://nitehawkcinema.com" },
  { name: "BAM Rose Cinemas", slug: "bam-rose", borough: "Brooklyn" as const, neighborhood: "Fort Greene", websiteUrl: "https://www.bam.org" },
  { name: "Alamo Drafthouse Brooklyn", slug: "alamo-brooklyn", borough: "Brooklyn" as const, neighborhood: "Downtown Brooklyn", websiteUrl: "https://drafthouse.com" },
  { name: "Syndicated", slug: "syndicated", borough: "Brooklyn" as const, neighborhood: "Bushwick", websiteUrl: "https://syndicatedbk.com" },
  { name: "Regal UA Court Street", slug: "regal-court-street", borough: "Brooklyn" as const, neighborhood: "Cobble Hill", websiteUrl: "https://www.regmovies.com" },
  { name: "Angelika Film Center", slug: "angelika", borough: "Manhattan" as const, neighborhood: "NoHo", websiteUrl: "https://angelikafilmcenter.com" },
  { name: "IFC Center", slug: "ifc-center", borough: "Manhattan" as const, neighborhood: "Greenwich Village", websiteUrl: "https://www.ifccenter.com" },
  { name: "Film Forum", slug: "film-forum", borough: "Manhattan" as const, neighborhood: "West Village", websiteUrl: "https://filmforum.org" },
  { name: "Metrograph", slug: "metrograph", borough: "Manhattan" as const, neighborhood: "Lower East Side", websiteUrl: "https://metrograph.com" },
  { name: "AMC Lincoln Square", slug: "amc-lincoln-square", borough: "Manhattan" as const, neighborhood: "Upper West Side", websiteUrl: "https://www.amctheatres.com" },
  { name: "Regal Essex Crossing", slug: "regal-essex", borough: "Manhattan" as const, neighborhood: "Lower East Side", websiteUrl: "https://www.regmovies.com" },
  { name: "Village East by Angelika", slug: "village-east", borough: "Manhattan" as const, neighborhood: "East Village", websiteUrl: "https://angelikafilmcenter.com" },
  { name: "Museum of the Moving Image", slug: "momi", borough: "Queens" as const, neighborhood: "Astoria", websiteUrl: "https://movingimage.us" },
];

async function seed() {
  for (const cinema of cinemaData) {
    await db
      .insert(cinemas)
      .values({ id: crypto.randomUUID(), ...cinema })
      .onConflictDoNothing();
  }
  console.log(`Seeded ${cinemaData.length} cinemas`);
}

seed();
