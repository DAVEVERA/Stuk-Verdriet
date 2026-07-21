export function formatDate(value: string) {
  return new Intl.DateTimeFormat("nl-NL", { day: "numeric", month: "long", year: "numeric" }).format(new Date(value));
}

export const podcastPlaceholderAudioUrl = "/audio/podcast-placeholder.wav";

export function getEpisodeAudioUrl(episode: { audio_file_url?: string | null }) {
  return episode.audio_file_url || podcastPlaceholderAudioUrl;
}
