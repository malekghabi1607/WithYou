-- Extension pour pouvoir générer des UUID automatiquement
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- On supprime tout proprement si ça existe déjà
DROP TABLE IF EXISTS notation CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS salon_member CASCADE;
DROP TABLE IF EXISTS historique_video CASCADE;
DROP TABLE IF EXISTS sondage_salon CASCADE;
DROP TABLE IF EXISTS playlist CASCADE;
DROP TABLE IF EXISTS salon CASCADE;
DROP TABLE IF EXISTS video CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1) Utilisateurs
CREATE TABLE users (
    id_user       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username      VARCHAR(50)  NOT NULL,
    email         VARCHAR(100) NOT NULL UNIQUE,
    password_hash TEXT         NOT NULL
);

-- 2) Vidéos
CREATE TABLE video (
    id_video     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    youtube_id   VARCHAR(50) NOT NULL UNIQUE,
    title        VARCHAR(255) NOT NULL,
    thumbnail_url TEXT,
    duration     INT
);

-- 3) Salons
CREATE TABLE salon (
    id_salon         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name             VARCHAR(100) NOT NULL,
    date_created     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    owner_id         UUID NOT NULL,
    current_video_id UUID,
    CONSTRAINT fk_salon_owner
        FOREIGN KEY (owner_id) REFERENCES users(id_user) ON DELETE CASCADE,
    CONSTRAINT fk_salon_current_video
        FOREIGN KEY (current_video_id) REFERENCES video(id_video)
);

-- 4) Playlists par salon
CREATE TABLE playlist (
    id_playlist UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(100) NOT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    salon_id    UUID NOT NULL,
    CONSTRAINT fk_playlist_salon
        FOREIGN KEY (salon_id) REFERENCES salon(id_salon) ON DELETE CASCADE
);

-- 5) Sondages par salon
CREATE TABLE sondage_salon (
    id_sondage UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL,
    moyenne    FLOAT,
    nb_votes   INT,
    rang       INT,
    salon_id   UUID NOT NULL,
    CONSTRAINT fk_sondage_creator
        FOREIGN KEY (creator_id) REFERENCES users(id_user) ON DELETE CASCADE,
    CONSTRAINT fk_sondage_salon
        FOREIGN KEY (salon_id) REFERENCES salon(id_salon) ON DELETE CASCADE
);

-- 6) Historique des vidéos vues
CREATE TABLE historique_video (
    id_historique SERIAL PRIMARY KEY,
    video_id      UUID NOT NULL,
    user_id       UUID NOT NULL,
    salon_id      UUID NOT NULL,
    date_lecture  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_hist_video
        FOREIGN KEY (video_id) REFERENCES video(id_video) ON DELETE CASCADE,
    CONSTRAINT fk_hist_user
        FOREIGN KEY (user_id) REFERENCES users(id_user) ON DELETE CASCADE,
    CONSTRAINT fk_hist_salon
        FOREIGN KEY (salon_id) REFERENCES salon(id_salon) ON DELETE CASCADE
);

-- 7) Membres d’un salon
CREATE TABLE salon_member (
    id_salon_member UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL,
    salon_id        UUID NOT NULL,
    join_date       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_sm_user
        FOREIGN KEY (user_id) REFERENCES users(id_user) ON DELETE CASCADE,
    CONSTRAINT fk_sm_salon
        FOREIGN KEY (salon_id) REFERENCES salon(id_salon) ON DELETE CASCADE,
    CONSTRAINT uq_sm_user_salon UNIQUE (user_id, salon_id)
);

-- 8) Messages (chat)
CREATE TABLE messages (
    id_message UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content    TEXT NOT NULL,
    sent_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    user_id    UUID NOT NULL,
    salon_id   UUID NOT NULL,
    CONSTRAINT fk_msg_user
        FOREIGN KEY (user_id) REFERENCES users(id_user) ON DELETE CASCADE,
    CONSTRAINT fk_msg_salon
        FOREIGN KEY (salon_id) REFERENCES salon(id_salon) ON DELETE CASCADE
);

-- 9) Notation des vidéos
CREATE TABLE notation (
    id_notation   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    note          INT NOT NULL CHECK (note BETWEEN 0 AND 5),
    commentaire   TEXT,
    date_notation TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    user_id       UUID NOT NULL,
    video_id      UUID NOT NULL,
    CONSTRAINT fk_notation_user
        FOREIGN KEY (user_id) REFERENCES users(id_user) ON DELETE CASCADE,
    CONSTRAINT fk_notation_video
        FOREIGN KEY (video_id) REFERENCES video(id_video) ON DELETE CASCADE
);