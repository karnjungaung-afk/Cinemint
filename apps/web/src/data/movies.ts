import legacyMovies from "@/data/movies.seed.json";
import type { MoviePreview } from "@/types/movie";

type LegacyMovie = {
  id: string;
  title: string;
  year: number;
  duration: string;
  director?: string;
  cast?: string[];
  genres?: string[];
  rating: number;
  releaseDate?: string;
  status?: string;
  tmdbId: number;
  poster: string;
  backdrop: string;
  trailerEmbed?: string;
  synopsis: string;
  aiReview?: string;
  pros?: string[];
  cons?: string[];
};

export const movies: MoviePreview[] = (legacyMovies as LegacyMovie[]).map((movie) => ({
  slug: movie.id,
  title: movie.title,
  originalTitle: movie.title,
  year: movie.year,
  runtime: movie.duration,
  score: movie.rating,
  genres: movie.genres ?? [],
  synopsis: movie.synopsis,
  posterUrl: movie.poster,
  backdropUrl: movie.backdrop,
  editorialNote: movie.aiReview ?? "Editorial notes are being reviewed.",
  director: movie.director ?? "Not available",
  cast: movie.cast ?? [],
  releaseDate: movie.releaseDate ?? "Not available",
  status: movie.status ?? "Not available",
  tmdbId: movie.tmdbId,
  trailerEmbed: movie.trailerEmbed ?? null,
  pros: movie.pros ?? [],
  cons: movie.cons ?? [],
}));

export function getMovieBySlug(slug: string): MoviePreview | undefined {
  return movies.find((movie) => movie.slug === slug);
}
