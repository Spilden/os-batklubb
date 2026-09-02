import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`camera_log_entries\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`date\` text NOT NULL,
  	\`user_id\` integer,
  	\`author_name\` text NOT NULL,
  	\`content\` text NOT NULL,
  	\`edited_at\` text,
  	\`source\` text DEFAULT 'live',
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`camera_log_entries_user_idx\` ON \`camera_log_entries\` (\`user_id\`);`)
  await db.run(sql`CREATE INDEX \`camera_log_entries_updated_at_idx\` ON \`camera_log_entries\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`camera_log_entries_created_at_idx\` ON \`camera_log_entries\` (\`created_at\`);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`camera_log_entries_id\` integer REFERENCES camera_log_entries(id);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_camera_log_entries_id_idx\` ON \`payload_locked_documents_rels\` (\`camera_log_entries_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`camera_log_entries\`;`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_payload_locked_documents_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`users_id\` integer,
  	\`media_id\` integer,
  	\`news_id\` integer,
  	\`partners_id\` integer,
  	\`contact_submissions_id\` integer,
  	\`slipp_bookings_id\` integer,
  	\`clubhouse_bookings_id\` integer,
  	\`events_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`news_id\`) REFERENCES \`news\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`partners_id\`) REFERENCES \`partners\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`contact_submissions_id\`) REFERENCES \`contact_submissions\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`slipp_bookings_id\`) REFERENCES \`slipp_bookings\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`clubhouse_bookings_id\`) REFERENCES \`clubhouse_bookings\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`events_id\`) REFERENCES \`events\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_payload_locked_documents_rels\`("id", "order", "parent_id", "path", "users_id", "media_id", "news_id", "partners_id", "contact_submissions_id", "slipp_bookings_id", "clubhouse_bookings_id", "events_id") SELECT "id", "order", "parent_id", "path", "users_id", "media_id", "news_id", "partners_id", "contact_submissions_id", "slipp_bookings_id", "clubhouse_bookings_id", "events_id" FROM \`payload_locked_documents_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(sql`ALTER TABLE \`__new_payload_locked_documents_rels\` RENAME TO \`payload_locked_documents_rels\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_users_id_idx\` ON \`payload_locked_documents_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_media_id_idx\` ON \`payload_locked_documents_rels\` (\`media_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_news_id_idx\` ON \`payload_locked_documents_rels\` (\`news_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_partners_id_idx\` ON \`payload_locked_documents_rels\` (\`partners_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_contact_submissions_id_idx\` ON \`payload_locked_documents_rels\` (\`contact_submissions_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_slipp_bookings_id_idx\` ON \`payload_locked_documents_rels\` (\`slipp_bookings_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_clubhouse_bookings_id_idx\` ON \`payload_locked_documents_rels\` (\`clubhouse_bookings_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_events_id_idx\` ON \`payload_locked_documents_rels\` (\`events_id\`);`)
}
