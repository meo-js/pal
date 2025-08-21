import { config } from '@meojs/utc';
console.log((await config('vitest')).test.projects);

export default config('vitest');
