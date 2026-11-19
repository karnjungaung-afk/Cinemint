import type { MoviePreview } from "@/types/movie";

const imageBase = "https://image.tmdb.org/t/p";

export const movies: MoviePreview[] = [
  {
    slug: "jurassic-world",
    title: "Jurassic World",
    originalTitle: "Jurassic World",
    year: 2015,
    runtime: "124 min",
    score: 85,
    genres: ["Adventure", "Sci-Fi", "Action"],
    synopsis:
      "A fully operating dinosaur theme park becomes the setting for a high-stakes story about ambition, science, and the limits of control.",
    posterUrl: `${imageBase}/w500/rhr4y79GpxQF9IsfJItRXVaoGs4.jpg`,
    backdropUrl: `${imageBase}/w1280/xX0IzuFa1Fj06iU2NlOmeMPe7oS.jpg`,
    editorialNote:
      "A large-scale adventure built around spectacle, momentum, and the thrill of discovery.",
  },
  {
    slug: "pacific-rim",
    title: "Pacific Rim",
    originalTitle: "Pacific Rim",
    year: 2013,
    runtime: "131 min",
    score: 86,
    genres: ["Sci-Fi", "Adventure", "Action"],
    synopsis:
      "When enormous creatures rise from the Pacific, humanity builds giant machines and asks two pilots to stand together.",
    posterUrl: `${imageBase}/w500/RXhBbLCZZ2Xu0imtffjDp6uqgG.jpg`,
    backdropUrl: `${imageBase}/w1280/9X7Im1YuBhyHYVD8r7CAONPJR5k.jpg`,
    editorialNote:
      "Distinctive production design and a sense of scale give this science-fiction adventure its identity.",
  },
  {
    slug: "low-season",
    title: "Low Season",
    originalTitle: "สุขสันต์วันโสด",
    year: 2020,
    runtime: "125 min",
    score: 80,
    genres: ["Romance", "Comedy", "Horror"],
    synopsis:
      "A heartbroken traveller heads into the mountains during the quiet season and finds an unexpected group of companions.",
    posterUrl: `${imageBase}/w500/pRZcPJwHecww2x9J0RoFAW2hLTb.jpg`,
    backdropUrl: `${imageBase}/w1280/otI1uqCHcjz7RwtES1TWS3NFjtO.jpg`,
    editorialNote:
      "A warm mix of northern scenery, gentle comedy, romance, and a playful ghost-story atmosphere.",
  },
  {
    slug: "citizen-dog",
    title: "Citizen Dog",
    originalTitle: "หมานคร",
    year: 2004,
    runtime: "100 min",
    score: 80,
    genres: ["Comedy", "Fantasy", "Romance"],
    synopsis:
      "A young man moves to Bangkok and encounters a surreal city while searching for love and a sense of direction.",
    posterUrl: `${imageBase}/w500/b9YeVF0VTF3NfPWITdVZu1Lo5qY.jpg`,
    backdropUrl: `${imageBase}/w1280/4d1TUmWij6Tt3YaTJfbZsSSreDy.jpg`,
    editorialNote:
      "A vivid, imaginative portrait of city life told through magical realism and striking visual ideas.",
  },
];

export function getMovieBySlug(slug: string): MoviePreview | undefined {
  return movies.find((movie) => movie.slug === slug);
}
