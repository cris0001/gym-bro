-- Custom SQL migration file, put your code below! --
-- Accent-insensitive name search: "ryz bialy" finds "Ryż biały". unaccent() strips
-- diacritics; the repositories compare unaccent(name) with unaccent(query).
CREATE EXTENSION IF NOT EXISTS unaccent;
