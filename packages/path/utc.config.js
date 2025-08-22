import { config } from '@meojs/utc';

export default config({
  web: {
    // FIXME: 因为 rolldown 没有足够的 treeshake
    platform: 'node',
  },
});
