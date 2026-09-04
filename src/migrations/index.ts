import * as migration_20260902_133201_initial_schema from './20260902_133201_initial_schema';
import * as migration_20260902_134900_add_camera_log_entries from './20260902_134900_add_camera_log_entries';
import * as migration_20260903_181630_add_medlem_siden from './20260903_181630_add_medlem_siden';

export const migrations = [
  {
    up: migration_20260902_133201_initial_schema.up,
    down: migration_20260902_133201_initial_schema.down,
    name: '20260902_133201_initial_schema',
  },
  {
    up: migration_20260902_134900_add_camera_log_entries.up,
    down: migration_20260902_134900_add_camera_log_entries.down,
    name: '20260902_134900_add_camera_log_entries',
  },
  {
    up: migration_20260903_181630_add_medlem_siden.up,
    down: migration_20260903_181630_add_medlem_siden.down,
    name: '20260903_181630_add_medlem_siden'
  },
];
