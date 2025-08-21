import { config } from '@meojs/utc';

export default config({
  web: {
    build: {
      conditions: ['cocos', 'node', 'default'],
      tsdown: {
        external: ['cc/env', 'cc'],
      },
    },
    // FIXME: 因为 rolldown 没有足够的 treeshake
    platform: 'node',
  },
});
