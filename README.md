# Glicenstein — zaszyfrowany atlas badawczy

Kod ekranu dostępu jest publiczny; zasoby w `vault/` są zaszyfrowane przy użyciu AES-256-GCM oraz PBKDF2-HMAC-SHA256 (600 000 iteracji). Hasło **nie** znajduje się w repozytorium.

## Wdrożenie

1. Utwórz **NOWE, puste publiczne** repozytorium `KAALogos/glicenstein-atlas`.
2. Wgraj **wyłącznie zawartość katalogu `site/`** (plik `index.html`, `README.md`, `.nojekyll`, `robots.txt` i katalog `vault/`). Nie wgrywaj oryginalnego HTML, JSON, plików JPG, plików źródłowych ani hasła.
3. W repozytorium otwórz **Settings → Pages → Build and deployment → Deploy from a branch → main → /(root) → Save**.
4. Strona będzie dostępna pod publicznym adresem `https://kaalogos.github.io/glicenstein-atlas/`, ale atlas pojawi się dopiero po poprawnym haśle.

## Co jest zabezpieczone

- Cała wersja atlasu HTML, wraz z osadzonymi danymi, opisami i miniaturami.
- Archiwum 9 oryginalnych fotografii; cztery części zaszyfrowane niezależnie. Po otwarciu atlasu można pobrać je jako ZIP.

Hasło jest konieczne także do odtworzenia źródłowych danych. Nie przechowuj go w README, zgłoszeniach Issues, commicie ani plikach workflow.

**Ograniczenia:** kod i metadane repozytorium są publiczne. Każda osoba znająca hasło może odszyfrować i skopiować całość. To nie jest system kont użytkowników. Po wpisaniu hasła aplikacja może ładować zasoby zewnętrzne (muzea, galerie), ujawniając tym serwisom standardowe informacje o żądaniach przeglądarki. Edycje w oryginalnej aplikacji zapisują się lokalnie i należy je eksportować do JSON. Nie umieszczaj hasła w kodzie JS ani w historii Gita.

## Aktualizacja

Aby przebudować pakiet, użyj `build_scripts/build_secure_site.py` z prywatnym plikiem źródłowym i folderem zdjęć, następnie nadpisz zaszyfrowane pliki. Wymagany Python oraz `cryptography`. Script powinien pozostawać poza publicznym repo; dołączenie samego kodu skryptu nie ujawnia danych ani hasła.
