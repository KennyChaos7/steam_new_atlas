import type { NextConfig } from 'next';
import { BASE_PATH } from './lib/deployment';
const config: NextConfig = { output: 'export', basePath: BASE_PATH, images: { unoptimized: true }, trailingSlash: true };
export default config;
