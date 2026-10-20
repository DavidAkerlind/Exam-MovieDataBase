# Put MMDb online: the simple guide

Everything here is clicking in the Cloudflare dashboard. You do not need a terminal.
It takes about 20 minutes.

## The big idea

MMDb is **one thing** on Cloudflare, a "Worker" called `mmdb`. It does two jobs at the same address:

| Address | What answers |
| --- | --- |
| `https://mmdb…/` (every normal page) | the **website**: posters, search, favorites |
| `https://mmdb…/api/…` | the **back room**: it holds your secret keys and fetches movie data |

Think of a shop. The website is the shop window and everyone can see it. The back room has
a safe with your two secret keys (TMDb and OMDb). The window asks the back room for movie
info, and the keys never leave the safe. Nobody can read them, not even by looking at the code.

You will do four things: **(1)** connect GitHub to Cloudflare, **(2)** put the keys in the
safe, **(3)** test it, **(4)** give it the address `mmdb.davidakerlind.com`.

You already have other projects on Cloudflare (`portfolio-page`, `harpaviljongen`,
`sogonice` and so on). **Do not open or change them.** MMDb is a new, separate project.

## Before you start

- [ ] You are logged in at [dash.cloudflare.com](https://dash.cloudflare.com).
- [ ] You have your **new** TMDb key and OMDb key somewhere private (a password manager is perfect).
  Never paste them into chat, a file in the project, or GitHub.
  (No keys yet? TMDb: themoviedb.org → profile → Settings → API → copy the **API Key (v3)**.
  OMDb: omdbapi.com/apikey.aspx → free key, then click the link in the email.)
- [ ] The code is on the **`main`** branch of `DavidAkerlind/Exam-MovieDataBase`. That is the new version.
  The `OG` branch is the old page. Never deploy `OG`.

## Part 1: Create the project

1. In the dashboard open **Workers & Pages** and click **Create application**.
2. Choose **Import a repository** (the option that connects to GitHub). Choose **GitHub**.
3. Pick **`DavidAkerlind/Exam-MovieDataBase`** from the list.
   - **Not in the list?** Cloudflare's GitHub app is only allowed to see some repositories. Click
     **Configure** / **Add repositories**, tick `Exam-MovieDataBase`, save, and come back.
4. Fill in the settings:

| Setting | Type exactly |
| --- | --- |
| **Project name** | `mmdb` (all small letters. It must match the name inside the code, or the build fails.) |
| **Production branch** | `main` |
| **Build command** | leave empty |
| **Deploy command** | `npx wrangler deploy` (it is already filled in) |
| **Root directory** | `/` (leave as it is) |

5. If you see a switch for building non-production branches, turn it **off**. Then old branches never build.
6. Click **Save and Deploy**. Wait until the build says **Success**. This takes one or two minutes.

You now have a first address: **`https://mmdb.david-akerlind.workers.dev`**.
The pages will load, but they will say the movie data is not ready yet. That is normal. The safe is still empty.

## Part 2: Put the keys in the safe

1. Open **Workers & Pages** and click **`mmdb`**. It sits in the list next to `sogonice-v1-2`.
2. Go to **Settings**, then **Variables and Secrets**, then **Add**.
3. Make two entries. For each one, set **Type** to **Secret** (not "Text"), type the **name exactly**, paste the **value**, and save:

| Name (capitals and underscores, exactly) | Value |
| --- | --- |
| `TMDB_API_KEY` | your TMDb key |
| `OMDB_API_KEY` | your OMDb key |

4. Click **Deploy** if it asks you to. Secrets are encrypted, and after saving, nobody can read them back.

## Part 3: Test it

Open these two addresses in your browser:

1. `https://mmdb.david-akerlind.workers.dev/api/health`
   You should see `{"ok":true,"services":{"tmdb":true,"omdb":true}}`. Both must say `true`.
2. `https://mmdb.david-akerlind.workers.dev/`
   The home page should show movies and the trailer carousel.

Then try the real thing:

- [ ] Type in the search box. Results with posters should appear as you type.
- [ ] Click a movie. You should see the rating rings and bars.
- [ ] Click the heart. Hearts should burst and fly up to **Favorites**.
- [ ] Click a director's name. The page should zoom into their page.

| You see | Why | Fix |
| --- | --- | --- |
| `"tmdb":false` or `"omdb":false` | A secret is missing or the name is misspelled | Redo Part 2. Names are case-sensitive. |
| Movie rows empty, error says `upstream_auth` | TMDb or OMDb refused the key | Re-paste the whole key. TMDb wants the v3 key or the long v4 token. |
| Build failed, "name mismatch" | The project name is not `mmdb` | Settings → rename, or recreate the project as `mmdb`. |
| Build failed, anything else | Open the build log. The last red lines say why. | Tell me the lines and I will fix it. |

## Part 4: Use your own address

Goal: **`https://mmdb.davidakerlind.com`**.

**Step A: check that `davidakerlind.com` is on Cloudflare.** In the dashboard open **Websites**
(or **Domains**) and look for `davidakerlind.com`. Your other projects have custom domains, so
it is very likely there with the status **Active**.

- **It is there:** go to Step B.
- **It is not there:** go to Step A2 first. Your Worker already works on the `workers.dev`
  address, so nothing is lost while you do this.

**Step A2 (only if the domain is not on Cloudflare).**
1. Websites → **Add a domain** → type `davidakerlind.com` → choose the **Free** plan.
2. Cloudflare copies your existing DNS records. **Check them**, especially any `MX` or `TXT`
   records, which are your email. Don't delete anything.
3. Cloudflare shows you two **nameservers** (they look like `xxxx.ns.cloudflare.com`).
   Go to the company where you bought the domain, find "nameservers", and replace the old ones with these two.
   If DNSSEC is switched on there, switch it **off** first.
4. Wait until Cloudflare says **Active**. It can take up to a day, but is often a few minutes.

**Step B: attach the address to the Worker.**
1. **Workers & Pages** → **`mmdb`** → **Settings** → **Domains & Routes** → **Add** → **Custom domain**.
2. Type `mmdb.davidakerlind.com` and click **Add domain**.
3. Cloudflare creates the DNS record and the security certificate by itself.
   **Do not make a DNS record by hand.** That blocks it.
4. After a few minutes the status turns **Active**. Open `https://mmdb.davidakerlind.com` and repeat the Part 3 checks.

Your portfolio and other sites are on different names, so this does not touch them.

## Part 5: Clean up

- **Revoke the old keys.** The old TMDb/OMDb keys are visible in the repo's git history. Log in
  to TMDb and OMDb and delete or regenerate them. Your new keys are safe because they live only in Cloudflare.
- **Make `main` the default branch on GitHub** (optional). Repo → Settings → Branches → Default branch → `main`.
- **Turn off GitHub Pages** if it is on (optional). Repo → Settings → Pages. Cloudflare serves the site now.
- **Do not delete `OG`.** It is your saved copy of the original page.

## Day to day

| I want to… | Do this |
| --- | --- |
| Change the design or text | Edit the files, push to `main`. Cloudflare rebuilds and deploys by itself in a minute or two. |
| Swap a key | `mmdb` → Settings → Variables and Secrets → edit the secret. |
| See what happened | `mmdb` → Deployments (every deploy) and Logs (errors). |
| Go back to a working version | `mmdb` → Deployments → pick an older one → **Rollback**. |
| Cost | Free. The free plan allows 100,000 API requests a day, which your dashboard shows as "0 / 100,000". Normal pages cost nothing. Movie data is also cached for hours at Cloudflare, so you will stay far below it. |

## If something is wrong

| What you see | Why | Fix |
| --- | --- | --- |
| The old design shows | The production branch is not `main`, or your browser kept a copy | Settings → Build → production branch = `main`. Then hard-refresh with Ctrl+Shift+R (Cmd+Shift+R on Mac). |
| "Almost there: connect the API" | The site cannot reach `/api/…` | Open `/api/health`. If that works, hard-refresh. If not, check Part 1 and 2. |
| Error 522 or "too many redirects" on `mmdb.davidakerlind.com` | A hand-made DNS record is in the way | DNS → delete the `mmdb` record you made, then redo Part 4, Step B. |
| The `mmdb.davidakerlind.com` address won't load | The certificate is still being made | Wait ten minutes. |
| You pushed but nothing changed | The build failed | `mmdb` → Deployments → open the failed one → read the red lines. |

## Optional: try it on your own computer first

You need Node.js 20 or newer and Git.

```bash
git clone -b main https://github.com/DavidAkerlind/Exam-MovieDataBase.git
cd Exam-MovieDataBase
npm install
```

Create a file named `.dev.vars` in that folder (git ignores it, so it can never be committed) with:

```
TMDB_API_KEY=paste-your-tmdb-key
OMDB_API_KEY=paste-your-omdb-key
```

Then run `npm run dev` and open `http://localhost:8787`. That is the whole site plus the API.
No keys yet? `npm run worker:dev:mock` and `npm start` give you a fake catalogue instead
(see the README).

## Optional: deploy from a terminal instead

If you prefer commands to clicking:

```bash
npm install
npx wrangler login
npx wrangler deploy
npx wrangler secret put TMDB_API_KEY
npx wrangler secret put OMDB_API_KEY
```

A Worker made this way does not rebuild when you push to GitHub. Use the dashboard route
in Part 1 for automatic deploys.
