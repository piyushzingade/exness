import "dotenv/config";
import { Pool } from "pg";

export const pool = new Pool({
    connectionString: process.env.TIME_SCALE_DATABASE_URL,
});

async function setupDatabase() {
    try {
        const client = await pool.connect();
        try {
            await client.query(`
DROP TABLE IF EXISTS "trades" CASCADE;

CREATE TABLE trades (
    event_type   TEXT NOT NULL,
    event_time   TIMESTAMPTZ NOT NULL,
    symbol       TEXT NOT NULL,
    trade_id     BIGINT NOT NULL,
    price        NUMERIC NOT NULL,
    quantity     NUMERIC NOT NULL,
    trade_time   TIMESTAMPTZ NOT NULL,
    is_maker     BOOLEAN NOT NULL,
    PRIMARY KEY (symbol, trade_id, event_time)
);

SELECT create_hypertable('trades', 'event_time', chunk_time_interval => INTERVAL '1 day', if_not_exists => TRUE);
`);
            console.log("Trade table created successfully");

            await client.query(`
-- 1 second
DROP MATERIALIZED VIEW IF EXISTS klines_second CASCADE;
CREATE MATERIALIZED VIEW klines_second
WITH (timescaledb.continuous) AS
SELECT
    symbol,
    time_bucket('1 second', event_time) AS bucket,
    first(price, event_time) AS open_price,
    max(price) AS high_price,
    min(price) AS low_price,
    last(price, event_time) AS close_price,
    sum(quantity) AS volume,
    count(*) AS trade_count
FROM trades
GROUP BY symbol, bucket
WITH NO DATA;

SELECT add_continuous_aggregate_policy(
    'klines_second',
    start_offset => INTERVAL '5 seconds',
    end_offset   => INTERVAL '1 second',
    schedule_interval => INTERVAL '1 second'
);

-- 1 minute
DROP MATERIALIZED VIEW IF EXISTS klines_minute CASCADE;
CREATE MATERIALIZED VIEW klines_minute
WITH (timescaledb.continuous) AS
SELECT
    symbol,
    time_bucket('1 minute', event_time) AS bucket,
    first(price, event_time) AS open_price,
    max(price) AS high_price,
    min(price) AS low_price,
    last(price, event_time) AS close_price,
    sum(quantity) AS volume,
    count(*) AS trade_count
FROM trades
GROUP BY symbol, bucket
WITH NO DATA;

SELECT add_continuous_aggregate_policy(
    'klines_minute',
    start_offset => INTERVAL '3 minutes',
    end_offset   => INTERVAL '30 seconds',
    schedule_interval => INTERVAL '30 seconds'
);

-- 3 minutes
DROP MATERIALIZED VIEW IF EXISTS klines_3minute CASCADE;
CREATE MATERIALIZED VIEW klines_3minute
WITH (timescaledb.continuous) AS
SELECT
    symbol,
    time_bucket('3 minutes', event_time) AS bucket,
    first(price, event_time) AS open_price,
    max(price) AS high_price,
    min(price) AS low_price,
    last(price, event_time) AS close_price,
    sum(quantity) AS volume,
    count(*) AS trade_count
FROM trades
GROUP BY symbol, bucket
WITH NO DATA;

SELECT add_continuous_aggregate_policy(
    'klines_3minute',
    start_offset => INTERVAL '8 minutes',
    end_offset   => INTERVAL '1 minute',
    schedule_interval => INTERVAL '1 minute'
);

-- 5 minutes
DROP MATERIALIZED VIEW IF EXISTS klines_5minute CASCADE;
CREATE MATERIALIZED VIEW klines_5minute
WITH (timescaledb.continuous) AS
SELECT
    symbol,
    time_bucket('5 minutes', event_time) AS bucket,
    first(price, event_time) AS open_price,
    max(price) AS high_price,
    min(price) AS low_price,
    last(price, event_time) AS close_price,
    sum(quantity) AS volume,
    count(*) AS trade_count
FROM trades
GROUP BY symbol, bucket
WITH NO DATA;

SELECT add_continuous_aggregate_policy(
    'klines_5minute',
    start_offset => INTERVAL '12 minutes',
    end_offset   => INTERVAL '1 minute',
    schedule_interval => INTERVAL '1 minute'
);
`);

            console.log("All Klines tables created successfully");
        } finally {
            client.release();
        }
    } catch (error) {
        console.error("Error seeding database:", error);
    }
}

setupDatabase();