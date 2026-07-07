# 3D-Cute character references

Drop reference renders here (transparent PNGs) for the **3D Cute (`cute`) mascot
style** — a second, cuter 3D set, selectable via the **3D Cute** chip in the
Tweaks panel.

These feed the `MascotToyCute` renderer in `app/core/characters.jsx`. To use them:

1. Add the PNG to this folder.
2. Map it per species in `CUTE_SRC`, e.g. `cat: 'mochi-cute.png'`.
   (Or set `CUTE_DEFAULT` to use one render for every species.)

Until a species is mapped, **3D Cute** falls back to the base 3D figure so
nothing breaks.
