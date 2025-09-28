-- Create song table in Supabase
CREATE TABLE IF NOT EXISTS song (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    album VARCHAR(255),
    band VARCHAR(255) NOT NULL,
    year INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on band for faster sorting
CREATE INDEX IF NOT EXISTS idx_song_band ON song(band);

-- Insert sample data (optional)
INSERT INTO song (name, band, year) VALUES
('crazy', 'aerosmith', 1990),
('with or without you', 'u2', 1988),
('billy jean', 'michael jackson', 1982),
('imagine', 'john lennon', 1971),
('bohemian rhapsody', 'queen', 1975),
('like a rolling stone', 'bob dylan', 1965),
('shape of you', 'ed sheeran', 2017),
('smells like teen spirit', 'nirvana', 1991),
('thriller', 'michael jackson', 1982),
('kiss', 'prince', 1986),
('come as you are', 'nirvana', 1991)
ON CONFLICT DO NOTHING;
