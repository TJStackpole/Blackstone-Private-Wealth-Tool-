import { feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import statesTopo from "us-atlas/states-10m.json";

/** us-atlas state shapes, converted once at module load. */
const topo = statesTopo as unknown as Topology<{ states: GeometryCollection<{ name: string }> }>;

export const STATE_FEATURES: FeatureCollection<Geometry, { name: string }> = feature(topo, topo.objects.states);

export type StateFeature = Feature<Geometry, { name: string }> & { id: string };

export const STATE_FEATURE_LIST = STATE_FEATURES.features as StateFeature[];
