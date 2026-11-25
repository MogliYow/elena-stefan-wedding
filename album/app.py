"""Shared invitation albums. Run with gunicorn --chdir album app:application."""
import io
import json
import os
import re
import sqlite3
import time
import uuid
from contextlib import contextmanager, closing
from urllib.parse import parse_qs
from PIL import Image, ImageOps, UnidentifiedImageError

DATABASE = os.getenv("DATABASE_URL")
ORIGIN = os.getenv("INVITATION_ORIGIN", "https://mogliyow.github.io")
MAX_UPLOAD = 12 * 1024 * 1024
MAX_ALBUM = 128 * 1024 * 1024
Image.MAX_IMAGE_PIXELS = 30_000_000

@contextmanager
def database():
    if DATABASE:
        import psycopg
        connection = psycopg.connect(DATABASE)
    else:
        connection = sqlite3.connect(os.getenv("ALBUM_FILE", "albums.sqlite3"), timeout=20)
    with closing(connection), connection:
        yield connection

def execute(db, sql, values=()):
    return db.execute(sql.replace("?", "%s") if DATABASE else sql, values)

with database() as db:
    execute(db, "CREATE TABLE IF NOT EXISTS photos (event TEXT NOT NULL, id TEXT PRIMARY KEY, picture BYTEA NOT NULL)")
    execute(db, "CREATE INDEX IF NOT EXISTS event_photos ON photos(event,id)")

def application(env, start):
    def reply(status, body=b"", content="text/plain", cache="no-store"):
        start(status, [("Content-Type",content), ("Content-Length",str(len(body))),
              ("Access-Control-Allow-Origin",ORIGIN), ("Access-Control-Allow-Methods","GET, POST, OPTIONS"),
              ("Access-Control-Allow-Headers","Content-Type"), ("Cache-Control",cache),
              ("X-Content-Type-Options","nosniff")])
        return [body]
    path = re.fullmatch(r"/albums/(wedding|ognen)(?:/([0-9a-f]{48}))?", env.get("PATH_INFO",""))
    if not path: return reply("404 Not Found")
    event, photo = path.groups()
    method = env["REQUEST_METHOD"]
    if method == "OPTIONS": return reply("204 No Content")
    if method == "GET":
        with database() as db:
            if photo:
                row = execute(db,"SELECT picture FROM photos WHERE event=? AND id=?", (event,photo)).fetchone()
                if row: return reply("200 OK",bytes(row[0]),"image/jpeg","public, max-age=86400")
                return reply("404 Not Found")
            cursor = parse_qs(env.get("QUERY_STRING","")).get("before",["z"])[0]
            rows = execute(db,"SELECT id FROM photos WHERE event=? AND id<? ORDER BY id DESC LIMIT 24",(event,cursor))
            return reply("200 OK",json.dumps([r[0] for r in rows]).encode(),"application/json")
    if method != "POST" or photo: return reply("405 Method Not Allowed")
    if env.get("HTTP_ORIGIN") != ORIGIN: return reply("403 Forbidden")
    try:
        size = int(env.get("CONTENT_LENGTH") or 0)
        if not 0 < size <= MAX_UPLOAD: return reply("413 Payload Too Large")
        with Image.open(io.BytesIO(env["wsgi.input"].read(size)),formats=("JPEG","PNG","WEBP")) as image:
            if image.width * image.height > Image.MAX_IMAGE_PIXELS: return reply("413 Payload Too Large")
            image.thumbnail((1800,1800))
            oriented = ImageOps.exif_transpose(image).convert("RGBA")
            canvas = Image.new("RGB",oriented.size,"white")
            canvas.paste(oriented, mask=oriented.getchannel("A"))
            out = io.BytesIO()
            canvas.save(out,"JPEG",quality=82,optimize=True)
            picture = out.getvalue()
    except (ValueError, OSError, Image.DecompressionBombError, UnidentifiedImageError):
        return reply("415 Unsupported Media Type")
    with database() as db:
        if DATABASE:
            execute(db, "SELECT pg_advisory_xact_lock(?)",(1 if event=="wedding" else 2,))
        else:
            execute(db, "BEGIN IMMEDIATE")
        used = execute(db,"SELECT COALESCE(SUM(length(picture)),0) FROM photos WHERE event=?",(event,)).fetchone()[0]
        if used + len(picture) > MAX_ALBUM: return reply("507 Insufficient Storage")
        key = f"{time.time_ns():016x}" + uuid.uuid4().hex
        execute(db,"INSERT INTO photos(event,id,picture) VALUES(?,?,?)",(event,key,picture))
    return reply("201 Created")
