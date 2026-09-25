import type { APIRoute, GetStaticPaths } from 'astro';
import { render } from 'svelte/server';
import NailVisual from '../../components/visuals/NailVisual.svelte';
import EyeVisual from '../../components/visuals/EyeVisual.svelte';
import { illustrations, type IllustrationName } from '../../data/illustrations';

export const getStaticPaths = (() =>
  Object.keys(illustrations).map((name) => ({ params: { name } }))) satisfies GetStaticPaths;

export const GET: APIRoute = ({ params }) => {
  const entry = illustrations[params.name as IllustrationName];
  if (!entry) return new Response('Not found', { status: 404 });
  const { kind, ...props } = entry;
  const { body } =
    kind === 'nail'
      ? render(NailVisual, { props: { ...props, instant: true } })
      : render(EyeVisual, { props: { ...props, instant: true } });
  // Hydrations-Kommentare von Svelte entfernen, die Datei ist ein reines Bild
  const svg = body
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/ class="svelte-[a-z0-9]+"/g, '')
    .replace(/ svelte-[a-z0-9]+(?=")/g, '')
    .trim();
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n${svg}`, {
    headers: { 'Content-Type': 'image/svg+xml; charset=utf-8' },
  });
};
